import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserPreferenceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create a user's preference profile (E11.1)
   */
  async getPreferences(userId: string) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /**
   * Update explicit preferences from onboarding or settings (E11.2)
   */
  async updateExplicitPreferences(userId: string, data: {
    preferredLocations?: string[];
    preferredPropertyTypes?: string[];
    purpose?: string;
    budgetMin?: number;
    budgetMax?: number;
    bedroomsMin?: number;
    bedroomsMax?: number;
    paymentPreference?: string;
    preferredAmenities?: string[];
    preferredFinishing?: string;
    onboardingCompleted?: boolean;
  }) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: {
        ...data,
        onboardingCompleted: data.onboardingCompleted ?? true,
      },
      create: {
        userId,
        ...data,
        onboardingCompleted: data.onboardingCompleted ?? true,
      },
    });
  }

  /**
   * Record a property view and update implicit weights (E11.3 & E11.5)
   */
  async recordView(userId: string, propertyId: string) {
    // Upsert RecentlyViewed
    await this.prisma.recentlyViewed.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
      create: { userId, propertyId },
    });

    // Fetch property details to learn from
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { propertyType: true, features: true },
    });
    if (!property) return;

    // Update implicit weights (E11.3)
    const pref = await this.getPreferences(userId);
    const weights: Record<string, number> = (pref.implicitWeights as any) || {};

    // Learn from property type
    const typeName = property.propertyType?.nameEn;
    if (typeName) {
      weights[typeName] = Math.min(1.0, (weights[typeName] || 0) + 0.05);
    }

    // Learn from city
    if (property.city) {
      weights[property.city] = Math.min(1.0, (weights[property.city] || 0) + 0.05);
    }

    // Learn from features/amenities
    for (const feat of property.features || []) {
      const featureKey = feat.featureId || 'unknown';
      weights[featureKey] = Math.min(1.0, (weights[featureKey] || 0) + 0.03);
    }

    // Learn from price range
    const priceBucket = this.getPriceBucket(property.price);
    weights[priceBucket] = Math.min(1.0, (weights[priceBucket] || 0) + 0.04);

    // Learn from purpose
    weights[property.purpose] = Math.min(1.0, (weights[property.purpose] || 0) + 0.04);

    await this.prisma.userPreference.update({
      where: { userId },
      data: { implicitWeights: weights },
    });
  }

  /**
   * Get recently viewed properties (E11.5)
   */
  async getRecentlyViewed(userId: string, limit = 10) {
    return this.prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            media: { where: { isCover: true } },
            propertyType: true,
          },
        },
      },
      orderBy: { lastViewedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get "Continue Exploring" context (E11.6)
   */
  async getContinueExploring(userId: string) {
    const recent = await this.prisma.recentlyViewed.findMany({
      where: { userId },
      include: { property: { include: { propertyType: true } } },
      orderBy: { lastViewedAt: 'desc' },
      take: 5,
    });

    if (recent.length === 0) return null;

    // Detect the most common search pattern
    const cities: Record<string, number> = {};
    const types: Record<string, number> = {};
    let bedrooms = 0;
    let count = 0;

    for (const rv of recent) {
      if (rv.property.city) {
        cities[rv.property.city] = (cities[rv.property.city] || 0) + 1;
      }
      const typeName = rv.property.propertyType?.nameAr;
      if (typeName) {
        types[typeName] = (types[typeName] || 0) + 1;
      }
      bedrooms += rv.property.bedrooms || 0;
      count++;
    }

    const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0];
    const avgBedrooms = count > 0 ? Math.round(bedrooms / count) : 0;

    return {
      titleAr: `كنت تستكشف ${topType || 'عقارات'} ${avgBedrooms > 0 ? `${avgBedrooms} غرف` : ''} في ${topCity || 'مصر'}`,
      titleEn: `You were exploring ${avgBedrooms > 0 ? `${avgBedrooms}-bedroom` : ''} ${topType || 'properties'} in ${topCity || 'Egypt'}`,
      topCity,
      topType,
      avgBedrooms,
      recentCount: recent.length,
    };
  }

  /**
   * Apply preference decay (E11.19) — older weights decay exponentially
   */
  async applyPreferenceDecay(userId: string) {
    const pref = await this.getPreferences(userId);
    const weights: Record<string, number> = (pref.implicitWeights as any) || {};
    const decayFactor = 0.95; // 5% decay per cycle

    for (const key of Object.keys(weights)) {
      weights[key] = Math.round(weights[key] * decayFactor * 100) / 100;
      if (weights[key] < 0.05) delete weights[key]; // prune negligible weights
    }

    await this.prisma.userPreference.update({
      where: { userId },
      data: { implicitWeights: weights },
    });
  }

  /**
   * Toggle personalization (E11.16)
   */
  async togglePersonalization(userId: string, enabled: boolean) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: { personalizationEnabled: enabled },
      create: { userId, personalizationEnabled: enabled },
    });
  }

  /**
   * Reset all preferences (E11.28 Privacy)
   */
  async resetPreferences(userId: string) {
    await this.prisma.userPreference.upsert({
      where: { userId },
      update: {
        preferredLocations: Prisma.DbNull,
        preferredPropertyTypes: Prisma.DbNull,
        purpose: null,
        budgetMin: null,
        budgetMax: null,
        bedroomsMin: null,
        bedroomsMax: null,
        paymentPreference: null,
        preferredAmenities: Prisma.DbNull,
        preferredFinishing: null,
        implicitWeights: Prisma.DbNull,
        onboardingCompleted: false,
      },
      create: { userId },
    });

    // Clear recently viewed
    await this.prisma.recentlyViewed.deleteMany({ where: { userId } });

    // Clear recommendation feedback
    await this.prisma.recommendationFeedback.deleteMany({ where: { userId } });

    return { success: true, messageAr: 'تم مسح جميع التفضيلات بنجاح' };
  }

  private getPriceBucket(price: number): string {
    if (price < 1_000_000) return 'BUDGET_UNDER_1M';
    if (price < 3_000_000) return 'BUDGET_1M_3M';
    if (price < 5_000_000) return 'BUDGET_3M_5M';
    if (price < 10_000_000) return 'BUDGET_5M_10M';
    return 'BUDGET_OVER_10M';
  }
}
