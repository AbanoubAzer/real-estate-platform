import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MatchScoreEngine } from './match-score.engine';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private matchScoreEngine: MatchScoreEngine,
  ) {}

  /**
   * Generates personalized property recommendations for a user/session (E10.8).
   */
  async getPersonalizedRecommendations(userId?: string, sessionId?: string, limit = 6) {
    // 1. Fetch user context (favorites, saved searches, views)
    let userFavorites: any[] = [];
    let userViews: any[] = [];

    if (userId) {
      userFavorites = await this.prisma.favorite.findMany({
        where: { userId },
        include: { property: { include: { propertyType: true } } },
        take: 5,
      });

      userViews = await this.prisma.propertyView.findMany({
        where: { userId },
        include: { property: { include: { propertyType: true } } },
        take: 5,
        orderBy: { viewedAt: 'desc' },
      });
    }

    // Extract preferred cities, property types, and average target budget
    const preferredCities = new Set<string>();
    const preferredTypes = new Set<string>();
    const prices: number[] = [];

    [...userFavorites, ...userViews].forEach((item) => {
      const p = item.property;
      if (p) {
        if (p.city) preferredCities.add(p.city);
        if (p.propertyTypeId) preferredTypes.add(p.propertyTypeId);
        if (p.price) prices.push(p.price);
      }
    });

    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : undefined;

    // 2. Fetch candidate properties from database
    const candidates = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        ...(preferredCities.size > 0 ? { city: { in: Array.from(preferredCities) } } : {}),
      },
      include: {
        propertyType: true,
        media: { where: { isCover: true } },
        paymentPlans: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // 3. Score candidates
    const scored = candidates.map((prop) => {
      const matchResult = this.matchScoreEngine.calculateMatchScore(prop, {
        location: Array.from(preferredCities),
        maxPrice: avgPrice ? Math.round(avgPrice * 1.25) : undefined,
      });

      return {
        ...prop,
        matchScore: matchResult.matchScore,
        reasonsAr: matchResult.reasonsAr,
        reasonsEn: matchResult.reasonsEn,
      };
    });

    // Sort by Match Score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, limit);
  }

  /**
   * Returns smart similar properties for a given property detail page (E10.9).
   */
  async getSimilarProperties(propertyId: string, limit = 4) {
    const target = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { propertyType: true },
    });

    if (!target) return [];

    const minPrice = target.price * 0.7;
    const maxPrice = target.price * 1.3;

    const similars = await this.prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: 'PUBLISHED',
        city: target.city,
        price: { gte: minPrice, lte: maxPrice },
      },
      include: {
        propertyType: true,
        media: { where: { isCover: true } },
        paymentPlans: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return similars.map((prop) => {
      const matchResult = this.matchScoreEngine.calculateMatchScore(prop, {
        location: [target.city || ''],
        propertyType: target.propertyType?.nameEn,
        maxPrice: maxPrice,
        bedrooms: target.bedrooms ? { min: Math.max(1, target.bedrooms - 1) } : undefined,
      });

      return {
        ...prop,
        matchScore: matchResult.matchScore,
        reasonsAr: matchResult.reasonsAr,
        reasonsEn: matchResult.reasonsEn,
      };
    });
  }

  /**
   * Calculates an Investment Score (0 - 100) for a property (E10.12).
   */
  calculateInvestmentScore(property: any) {
    let score = 70;
    const reasonsAr: string[] = [];
    const reasonsEn: string[] = [];

    if (property.expectedRentalYield) {
      if (property.expectedRentalYield >= 8) {
        score += 15;
        reasonsAr.push(`عائد إيجاري مرتفع متوقع (${property.expectedRentalYield}%)`);
        reasonsEn.push(`High expected rental yield (${property.expectedRentalYield}%)`);
      }
    }

    if (property.paymentPlans && property.paymentPlans.length > 0) {
      score += 10;
      reasonsAr.push('خيارات تقسيط مريحة تسهل دخول الاستثمار');
      reasonsEn.push('Flexible installment options facilitate investment entry');
    }

    if (property.city === 'القاهرة' || property.city === 'الجيزة' || property.city === 'Hurghada') {
      score += 5;
      reasonsAr.push('منطقة ذات طلب استثماري وسياحي عالي');
      reasonsEn.push('High tourist and investment demand area');
    }

    return {
      investmentScore: Math.min(100, score),
      reasonsAr,
      reasonsEn,
    };
  }
}
