import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationFeedbackService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit recommendation feedback: HELPFUL / NOT_HELPFUL (E11.18)
   */
  async submitFeedback(userId: string, propertyId: string, feedbackType: string) {
    return this.prisma.recommendationFeedback.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: { feedbackType },
      create: { userId, propertyId, feedbackType },
    });
  }

  /**
   * Mark property as "Not Interested" with reason (E11.17)
   */
  async markNotInterested(userId: string, propertyId: string, reason?: string) {
    // Store the feedback
    await this.prisma.recommendationFeedback.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: { feedbackType: 'NOT_INTERESTED', reason },
      create: { userId, propertyId, feedbackType: 'NOT_INTERESTED', reason },
    });

    // Penalize similar features in implicit weights (E11.17 negative learning)
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { propertyType: true },
    });

    if (property) {
      const pref = await this.prisma.userPreference.findUnique({ where: { userId } });
      const weights: Record<string, number> = (pref?.implicitWeights as any) || {};

      // Apply negative weight based on reason
      if (reason === 'WRONG_LOCATION' && property.city) {
        weights[property.city] = Math.max(0, (weights[property.city] || 0.5) - 0.15);
      }
      if (reason === 'WRONG_TYPE' && property.propertyType?.nameEn) {
        weights[property.propertyType.nameEn] = Math.max(0, (weights[property.propertyType.nameEn] || 0.5) - 0.15);
      }
      if (reason === 'TOO_EXPENSIVE') {
        // User's budget is lower — reduce high-price preference
        weights['BUDGET_OVER_10M'] = Math.max(0, (weights['BUDGET_OVER_10M'] || 0) - 0.2);
        weights['BUDGET_5M_10M'] = Math.max(0, (weights['BUDGET_5M_10M'] || 0) - 0.1);
      }

      if (pref) {
        await this.prisma.userPreference.update({
          where: { userId },
          data: { implicitWeights: weights },
        });
      }
    }

    return { success: true, messageAr: 'لن نعرض لك عقارات مشابهة' };
  }

  /**
   * Get overall recommendation quality stats (E11.27)
   */
  async getPersonalizationAnalytics(userId: string) {
    const [totalFeedback, helpful, notHelpful, notInterested] = await Promise.all([
      this.prisma.recommendationFeedback.count({ where: { userId } }),
      this.prisma.recommendationFeedback.count({ where: { userId, feedbackType: 'HELPFUL' } }),
      this.prisma.recommendationFeedback.count({ where: { userId, feedbackType: 'NOT_HELPFUL' } }),
      this.prisma.recommendationFeedback.count({ where: { userId, feedbackType: 'NOT_INTERESTED' } }),
    ]);

    const helpfulRate = totalFeedback > 0 ? Math.round((helpful / totalFeedback) * 100) : 0;

    return {
      totalFeedback,
      helpful,
      notHelpful,
      notInterested,
      helpfulRate: `${helpfulRate}%`,
    };
  }
}
