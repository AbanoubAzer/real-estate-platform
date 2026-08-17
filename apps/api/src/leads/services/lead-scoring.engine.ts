import { Injectable } from '@nestjs/common';

export type LeadScoreCategory = 'COLD' | 'WARM' | 'HOT' | 'VERY_HOT';

export interface ScoreCalculationResult {
  score: number; // 0 - 100
  category: LeadScoreCategory;
  slaTargetMinutes: number; // 5m for VERY_HOT, 30m for HOT, 120m for WARM, 240m for COLD
  signals: { signal: string; points: number }[];
}

@Injectable()
export class LeadScoringEngine {
  /**
   * Calculates a 0-100 Lead Score based on user actions & inquiry signals (E11.3).
   */
  calculateScore(activities: any[] = [], inquiries: any[] = [], propertyInterestsCount = 1): ScoreCalculationResult {
    let score = 10; // Base score for any lead creation
    const signals: { signal: string; points: number }[] = [{ signal: 'Lead Created', points: 10 }];

    // Signal Weightings
    const signalWeights: Record<string, number> = {
      BOOK_VIEWING: 30,
      VIEWING_SCHEDULED: 30,
      VIEWING_BOOKED: 30,
      CONTACT_AGENT: 25,
      WHATSAPP: 25,
      CALL: 25,
      PRICING: 15,
      REQUEST_PRICING: 15,
      PAYMENT_PLAN: 15,
      REQUEST_PAYMENT_PLAN: 15,
      BROCHURE: 10,
      FAVORITE: 10,
      AI_SEARCH_MATCH: 10,
      PROPERTY_VIEW: 5,
    };

    // Evaluate Inquiries
    inquiries.forEach((inq) => {
      const pts = signalWeights[inq.inquiryType] || 10;
      score += pts;
      signals.push({ signal: `Inquiry: ${inq.inquiryType}`, points: pts });
    });

    // Evaluate Activities
    activities.forEach((act) => {
      const pts = signalWeights[act.type];
      if (pts) {
        score += pts;
        signals.push({ signal: `Activity: ${act.type}`, points: pts });
      }
    });

    // Bonus for multiple property interests
    if (propertyInterestsCount > 1) {
      const bonus = Math.min(20, propertyInterestsCount * 5);
      score += bonus;
      signals.push({ signal: `Multiple Property Interests (${propertyInterestsCount})`, points: bonus });
    }

    const finalScore = Math.min(100, Math.max(10, score));

    // Categorize (E11.3)
    let category: LeadScoreCategory = 'COLD';
    let slaTargetMinutes = 240; // 4 hours

    if (finalScore >= 81) {
      category = 'VERY_HOT';
      slaTargetMinutes = 5; // 5 min SLA (E11.22)
    } else if (finalScore >= 61) {
      category = 'HOT';
      slaTargetMinutes = 30; // 30 min SLA
    } else if (finalScore >= 31) {
      category = 'WARM';
      slaTargetMinutes = 120; // 2 hours
    }

    return {
      score: finalScore,
      category,
      slaTargetMinutes,
      signals,
    };
  }
}
