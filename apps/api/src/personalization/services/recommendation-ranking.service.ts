import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationRankingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the 5 personalized recommendation sections for a user (E11.13 & E11.14)
   */
  async getPersonalizedFeed(userId: string) {
    const pref = await this.prisma.userPreference.findUnique({ where: { userId } });
    const weights: Record<string, number> = (pref?.implicitWeights as any) || {};
    const isEnabled = pref?.personalizationEnabled !== false;

    // Get user's recently viewed, favorites, and negative feedback
    const [recentlyViewed, favorites, notInterested] = await Promise.all([
      this.prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { lastViewedAt: 'desc' },
        take: 20,
        select: { propertyId: true },
      }),
      this.prisma.favorite.findMany({
        where: { userId },
        select: { propertyId: true },
      }),
      this.prisma.recommendationFeedback.findMany({
        where: { userId, feedbackType: 'NOT_INTERESTED' },
        select: { propertyId: true },
      }),
    ]);

    const viewedIds = recentlyViewed.map((r) => r.propertyId);
    const favoriteIds = favorites.map((f) => f.propertyId);
    const excludeIds = notInterested.map((n) => n.propertyId);

    // All candidate properties (exclude not-interested)
    const allProperties = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: excludeIds },
      },
      include: {
        media: { where: { isCover: true } },
        propertyType: true,
        features: true,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate personalized scores (E11.24)
    const scoredProperties = allProperties.map((prop) => {
      let score = 50; // base

      if (isEnabled && pref) {
        // Explicit preference matching
        const locs = (pref.preferredLocations as string[]) || [];
        if (locs.length > 0 && prop.city && locs.some((l) => prop.city?.includes(l))) {
          score += 10;
        }

        const types = (pref.preferredPropertyTypes as string[]) || [];
        if (types.length > 0 && types.includes(prop.propertyType?.nameEn || '')) {
          score += 8;
        }

        if (pref.budgetMax && prop.price <= pref.budgetMax) score += 6;
        if (pref.budgetMin && prop.price >= pref.budgetMin) score += 4;
        if (pref.bedroomsMin && (prop.bedrooms || 0) >= pref.bedroomsMin) score += 5;

        // Implicit weight matching (E11.4)
        if (prop.propertyType?.nameEn && weights[prop.propertyType.nameEn]) {
          score += Math.round(weights[prop.propertyType.nameEn] * 10);
        }
        if (prop.city && weights[prop.city]) {
          score += Math.round(weights[prop.city] * 10);
        }
        for (const feat of prop.features || []) {
          const featureKey = feat.featureId || 'unknown';
          if (weights[featureKey]) {
            score += Math.round(weights[featureKey] * 5);
          }
        }
      }

      // Favorite similarity boost
      if (favoriteIds.includes(prop.id)) score += 5;

      // Freshness bonus (E11.24)
      const ageInDays = (Date.now() - new Date(prop.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) score += 3;
      else if (ageInDays < 30) score += 1;

      const finalScore = Math.min(100, Math.max(10, score));

      // Explainability reasons (E11.15)
      const reasons: string[] = [];
      const locs = (pref?.preferredLocations as string[]) || [];
      if (locs.length > 0 && prop.city && locs.some((l) => prop.city?.includes(l))) {
        reasons.push('✓ موقع مفضل لديك');
      }
      if (pref?.budgetMax && prop.price <= pref.budgetMax) {
        reasons.push('✓ ضمن ميزانيتك');
      }
      if (prop.bedrooms && pref?.bedroomsMin && prop.bedrooms >= pref.bedroomsMin) {
        reasons.push(`✓ ${prop.bedrooms} غرف نوم`);
      }
      if (ageInDays < 7) {
        reasons.push('✓ عقار جديد');
      }

      return { ...prop, personalizedScore: finalScore, reasons };
    });

    // Sort by personalized score
    scoredProperties.sort((a, b) => b.personalizedScore - a.personalizedScore);

    // Build sections (E11.14)
    const pickedForYou = scoredProperties.slice(0, 8);

    const becauseYouViewed = viewedIds.length > 0
      ? scoredProperties
          .filter((p) => !viewedIds.includes(p.id))
          .slice(0, 6)
      : [];

    const similarToFavorites = favoriteIds.length > 0
      ? scoredProperties
          .filter((p) => !favoriteIds.includes(p.id))
          .slice(0, 6)
      : [];

    const investmentOpportunities = pref?.purpose === 'INVESTMENT' || weights['INVESTMENT'] > 0.3
      ? scoredProperties
          .filter((p) => p.purpose === 'SALE')
          .slice(0, 6)
      : [];

    const newMatches = scoredProperties
      .filter((p) => {
        const ageInDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays < 7;
      })
      .slice(0, 6);

    return {
      pickedForYou,
      becauseYouViewed,
      similarToFavorites,
      investmentOpportunities,
      newMatches,
      totalCandidates: allProperties.length,
    };
  }

  /**
   * Personalized empty state with smart alternatives (E11.25 & E11.26)
   */
  async getSmartAlternatives(userId: string, originalFilters: any) {
    const alternatives: any[] = [];

    // Try expanding budget by 500K
    if (originalFilters.budgetMax) {
      const expandedBudget = originalFilters.budgetMax + 500000;
      const count = await this.prisma.property.count({
        where: { status: 'PUBLISHED', price: { lte: expandedBudget } },
      });
      if (count > 0) {
        alternatives.push({
          label: `+500K ميزانية → ${count} عقار`,
          labelEn: `+500K budget → ${count} properties`,
          filters: { ...originalFilters, budgetMax: expandedBudget },
          count,
        });
      }
    }

    // Try removing location filter
    if (originalFilters.city) {
      const count = await this.prisma.property.count({
        where: { status: 'PUBLISHED' },
      });
      alternatives.push({
        label: `كل المناطق → ${count} عقار`,
        labelEn: `All locations → ${count} properties`,
        filters: { ...originalFilters, city: undefined },
        count,
      });
    }

    // Try different property type
    const nearbyCount = await this.prisma.property.count({
      where: { status: 'PUBLISHED' },
    });
    alternatives.push({
      label: `جميع أنواع العقارات → ${nearbyCount} عقار`,
      labelEn: `All property types → ${nearbyCount} properties`,
      filters: {},
      count: nearbyCount,
    });

    return {
      message: 'لم نجد نتائج مطابقة تماماً',
      messageEn: "We couldn't find an exact match",
      alternatives: alternatives.slice(0, 3),
    };
  }
}
