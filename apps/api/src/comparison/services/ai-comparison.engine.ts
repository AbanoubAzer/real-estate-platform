import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiComparisonEngine {
  constructor(private prisma: PrismaService) {}

  /**
   * E12.2, E12.7, E12.8, E12.9, E12.12, E12.13
   * Generates a comprehensive AI comparison
   */
  async generateComparisonAnalysis(properties: any[], criteriaWeights: any, userIntent: string = 'LIVING') {
    if (!properties || properties.length < 2) return null;

    // Default weights if none provided
    const weights = criteriaWeights || {
      price: 30,
      space: 20,
      location: 20,
      investment: userIntent === 'INVESTMENT' ? 20 : 10,
      amenities: userIntent === 'INVESTMENT' ? 10 : 20,
    };

    const scoredProperties = properties.map(p => this.calculateScores(p, weights));
    
    // Find best in categories
    const bestPrice = [...scoredProperties].sort((a, b) => a.property.price - b.property.price)[0];
    const bestSpace = [...scoredProperties].sort((a, b) => (b.property.area || 0) - (a.property.area || 0))[0];
    const bestOverall = [...scoredProperties].sort((a, b) => b.totalScore - a.totalScore)[0];

    // Generate trade-offs
    const tradeoffs = this.generateTradeoffs(scoredProperties);

    // Add star ratings based on relative performance
    const maxScore = bestOverall.totalScore;
    const propertiesWithRatings = scoredProperties.map(sp => {
      const rating = Math.max(1, Math.round((sp.totalScore / maxScore) * 5));
      return {
        ...sp,
        rating,
        summary: this.generateSummary(sp.property, bestOverall.property.id === sp.property.id, userIntent),
      };
    });

    return {
      highlights: {
        bestPrice: { id: bestPrice.property.id, value: bestPrice.property.price },
        bestSpace: { id: bestSpace.property.id, value: bestSpace.property.area },
        bestMatch: { id: bestOverall.property.id, score: bestOverall.totalScore },
      },
      properties: propertiesWithRatings,
      tradeoffs,
    };
  }

  private calculateScores(property: any, weights: any) {
    let scores = {
      price: 0,
      space: 0,
      location: 0,
      investment: 0,
      amenities: 0,
    };

    // Very simplified scoring logic
    // Price: cheaper is better (assuming max price around 10M for normalization)
    scores.price = Math.max(0, 100 - (property.price / 100000));
    
    // Space: bigger is better
    scores.space = Math.min(100, (property.area || 50) / 2);
    
    // Location: Mocked score based on city length just for diversity
    scores.location = property.city ? 80 : 50;

    // Investment: Mocked rental yield potential
    scores.investment = property.purpose === 'INVESTMENT' ? 90 : 70;

    // Amenities: based on features count
    scores.amenities = Math.min(100, (property.features?.length || 0) * 15);

    // Apply weights
    const totalScore = Math.round(
      (scores.price * (weights.price / 100)) +
      (scores.space * (weights.space / 100)) +
      (scores.location * (weights.location / 100)) +
      (scores.investment * (weights.investment / 100)) +
      (scores.amenities * (weights.amenities / 100))
    );

    // Generate Pros/Cons
    const pros: string[] = [];
    const cons: string[] = [];
    
    if (scores.price > 80) pros.push('سعر ممتاز');
    else if (scores.price < 40) cons.push('سعر مرتفع نسبياً');

    if (scores.space > 80) pros.push('مساحة واسعة');
    else if (scores.space < 40) cons.push('مساحة محدودة');

    if (property.paymentPlans && property.paymentPlans.length > 0) pros.push('يوجد خطط سداد');
    if (property.features && property.features.length > 5) pros.push('خدمات ومرافق متكاملة');

    return {
      property,
      scores,
      totalScore,
      pros,
      cons,
      explainableScore: {
        price: Math.round(scores.price * (weights.price / 100)),
        space: Math.round(scores.space * (weights.space / 100)),
        location: Math.round(scores.location * (weights.location / 100)),
        investment: Math.round(scores.investment * (weights.investment / 100)),
        amenities: Math.round(scores.amenities * (weights.amenities / 100)),
        total: totalScore,
      }
    };
  }

  private generateTradeoffs(scoredProperties: any[]) {
    // E12.9 Trade-off analysis
    if (scoredProperties.length < 2) return [];

    const p1 = scoredProperties[0].property;
    const p2 = scoredProperties[1].property;

    const tradeoffs: any[] = [];

    if (p1.price < p2.price && (p1.area || 0) < (p2.area || 0)) {
      tradeoffs.push({
        textAr: `اختيار ${p1.title} يوفر لك ${((p2.price - p1.price) / 1000000).toFixed(1)} مليون، لكن المساحة أقل بـ ${(p2.area || 0) - (p1.area || 0)}م².`,
        textEn: `Choosing ${p1.title} saves you ${((p2.price - p1.price) / 1000000).toFixed(1)}M, but gives you ${(p2.area || 0) - (p1.area || 0)}m² less space.`,
        prop1Id: p1.id,
        prop2Id: p2.id,
      });
    } else if (p2.price < p1.price && (p2.area || 0) < (p1.area || 0)) {
       tradeoffs.push({
        textAr: `اختيار ${p2.title} يوفر لك ${((p1.price - p2.price) / 1000000).toFixed(1)} مليون، لكن المساحة أقل بـ ${(p1.area || 0) - (p2.area || 0)}م².`,
        textEn: `Choosing ${p2.title} saves you ${((p1.price - p2.price) / 1000000).toFixed(1)}M, but gives you ${(p1.area || 0) - (p2.area || 0)}m² less space.`,
        prop1Id: p2.id,
        prop2Id: p1.id,
      });
    }

    return tradeoffs;
  }

  private generateSummary(property: any, isBest: boolean, intent: string) {
    if (isBest) return intent === 'INVESTMENT' ? 'أفضل خيار استثماري بناءً على العائد المحتمل.' : 'أفضل تطابق بشكل عام لاحتياجاتك.';
    if (property.price < 3000000) return 'أقل سعراً ولكن ينقصه بعض المميزات.';
    if ((property.area || 0) > 150) return 'مساحة ممتازة للعائلة ولكن السعر أعلى قليلاً.';
    return 'خيار جيد كبديل للمقارنة.';
  }

  /**
   * Mock implementation for E12.10 (Ask AI)
   */
  async answerQuestion(properties: any[], question: string) {
    const qLower = question.toLowerCase();
    
    if (qLower.includes('أرخص') || qLower.includes('cheaper')) {
      const cheapest = [...properties].sort((a, b) => a.price - b.price)[0];
      return `العقار "${cheapest.title}" هو الأرخص بسعر ${(cheapest.price / 1000000).toFixed(1)} مليون.`;
    }
    
    if (qLower.includes('مساحة') || qLower.includes('أكبر') || qLower.includes('space') || qLower.includes('bigger')) {
      const biggest = [...properties].sort((a, b) => (b.area || 0) - (a.area || 0))[0];
      return `العقار "${biggest.title}" هو الأكبر بمساحة ${biggest.area} م².`;
    }

    if (qLower.includes('استثمار') || qLower.includes('investment')) {
      return 'العقار الأول يبدو أفضل للاستثمار بسبب موقعه وسعره التنافسي مقارنة بمتوسط السوق.';
    }

    return 'بناءً على المعطيات، كل عقار له مميزاته، اختيارك يعتمد على أولوياتك (مساحة أم سعر).';
  }
}
