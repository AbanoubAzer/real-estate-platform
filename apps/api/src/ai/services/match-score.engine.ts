import { Injectable } from '@nestjs/common';
import { ParsedSearchFilter } from './ai-parser.service';

export interface PropertyMatchResult {
  propertyId: string;
  matchScore: number; // 0 - 100
  hardMatch: boolean;
  reasonsAr: string[];
  reasonsEn: string[];
  scoreBreakdown: {
    locationScore: number;
    priceScore: number;
    typeScore: number;
    purposeScore: number;
    paymentScore: number;
    bedroomsScore: number;
    softScore: number;
  };
}

@Injectable()
export class MatchScoreEngine {
  /**
   * Evaluates a property against parsed user filters and calculates a 0-100 Match Score with explanations.
   */
  calculateMatchScore(property: any, filters: ParsedSearchFilter): PropertyMatchResult {
    let locationScore = 100;
    let priceScore = 100;
    let typeScore = 100;
    let purposeScore = 100;
    let paymentScore = 100;
    let bedroomsScore = 100;
    let softScore = 100;

    let hardMatch = true;
    const reasonsAr: string[] = [];
    const reasonsEn: string[] = [];

    // 1. Location Weight (25%)
    if (filters.location && filters.location.length > 0) {
      const propCity = (property.city || '').toLowerCase();
      const propArea = (property.areaLocation || '').toLowerCase();

      const matchedLoc = filters.location.some((loc) => {
        const l = loc.toLowerCase();
        return propCity.includes(l) || propArea.includes(l) || l.includes(propCity) || l.includes(propArea);
      });

      if (matchedLoc) {
        locationScore = 100;
        reasonsAr.push(`يتطابق مع الموقع المطلوب (${property.city} - ${property.areaLocation})`);
        reasonsEn.push(`Matches requested location (${property.city} - ${property.areaLocation})`);
      } else {
        locationScore = 30;
        hardMatch = false;
      }
    } else {
      locationScore = 85; // neutral default
    }

    // 2. Price Weight (20%)
    if (filters.maxPrice && property.price) {
      if (property.price <= filters.maxPrice) {
        priceScore = 100;
        reasonsAr.push(`يناسب الميزانية المحددة (السعر: ${property.price.toLocaleString()} ج.م)`);
        reasonsEn.push(`Fits your budget (Price: ${property.price.toLocaleString()} EGP)`);
      } else {
        const diffRatio = (property.price - filters.maxPrice) / filters.maxPrice;
        if (diffRatio <= 0.15) {
          priceScore = 75; // close budget match
          reasonsAr.push(`قريب جداً من الميزانية (+${Math.round(diffRatio * 100)}%)`);
          reasonsEn.push(`Very close to budget (+${Math.round(diffRatio * 100)}%)`);
        } else {
          priceScore = 20;
          hardMatch = false;
        }
      }
    }

    // 3. Property Type Weight (15%)
    if (filters.propertyType && property.propertyType) {
      const targetType = filters.propertyType.toLowerCase();
      const propTypeEn = (property.propertyType.nameEn || '').toLowerCase();
      const propTypeAr = (property.propertyType.nameAr || '').toLowerCase();

      if (propTypeEn.includes(targetType) || propTypeAr.includes(targetType) || targetType.includes(propTypeEn)) {
        typeScore = 100;
        reasonsAr.push(`نوع العقار المطابق: ${property.propertyType.nameAr}`);
        reasonsEn.push(`Matching property type: ${property.propertyType.nameEn}`);
      } else {
        typeScore = 40;
      }
    }

    // 4. Purpose Weight (10%)
    if (filters.purpose && property.purpose) {
      if (filters.purpose === 'SALE' && property.purpose === 'SALE') {
        purposeScore = 100;
        reasonsAr.push('عقار متاح للبيع السكني');
        reasonsEn.push('Available for sale');
      } else if (filters.purpose === 'RENT' && property.purpose === 'RENT') {
        purposeScore = 100;
        reasonsAr.push('عقار متاح للإيجار');
        reasonsEn.push('Available for rent');
      } else if (filters.purpose === 'INVESTMENT') {
        purposeScore = 95;
        reasonsAr.push('مناسب جداً للاستثمار وحساب العائد');
        reasonsEn.push('Highly suitable for investment & ROI');
      } else {
        purposeScore = 50;
      }
    }

    // 5. Payment Plan Weight (10%)
    if (filters.paymentPlan?.enabled) {
      const hasInstallmentPlans = property.paymentPlans && property.paymentPlans.length > 0;
      if (hasInstallmentPlans) {
        paymentScore = 100;
        reasonsAr.push('أنظمة تقسيط مريحة متوفرة');
        reasonsEn.push('Flexible installment plans available');
      } else if (property.downPayment || property.installmentDuration) {
        paymentScore = 85;
        reasonsAr.push('خيارات دفع مرخة متوفرة');
        reasonsEn.push('Flexible payment options available');
      } else {
        paymentScore = 40;
      }
    }

    // 6. Bedrooms Weight (10%)
    if (filters.bedrooms?.min !== undefined && property.bedrooms !== undefined && property.bedrooms !== null) {
      if (property.bedrooms >= filters.bedrooms.min) {
        bedroomsScore = 100;
        reasonsAr.push(`يحتوي على ${property.bedrooms} غرف نوم كما طلبت`);
        reasonsEn.push(`Contains ${property.bedrooms} bedrooms as requested`);
      } else {
        bedroomsScore = 50;
      }
    }

    // 7. Soft Preferences Weight (5%)
    let softPoints = 0;
    let softTotal = 0;

    if (filters.seaView) {
      softTotal += 1;
      const text = `${property.title} ${property.description}`.toLowerCase();
      if (text.includes('بحر') || text.includes('شاطئ') || text.includes('sea') || text.includes('beach')) {
        softPoints += 1;
        reasonsAr.push('إطلالة ممتازة بالقرب من البحر');
        reasonsEn.push('Great view near the beach');
      }
    }

    if (filters.quietFamily) {
      softTotal += 1;
      softPoints += 1; // General bonus for residential compounds
      reasonsAr.push('منطقة هادئة ومناسبة جداً للعائلات');
      reasonsEn.push('Quiet and family-friendly environment');
    }

    if (softTotal > 0) {
      softScore = Math.round((softPoints / softTotal) * 100);
    }

    // Weighted final calculation
    const weightedScore = Math.round(
      locationScore * 0.25 +
      priceScore * 0.20 +
      typeScore * 0.15 +
      purposeScore * 0.10 +
      paymentScore * 0.10 +
      bedroomsScore * 0.10 +
      softScore * 0.10
    );

    const finalMatchScore = Math.min(100, Math.max(35, weightedScore));

    return {
      propertyId: property.id,
      matchScore: finalMatchScore,
      hardMatch,
      reasonsAr: Array.from(new Set(reasonsAr)),
      reasonsEn: Array.from(new Set(reasonsEn)),
      scoreBreakdown: {
        locationScore,
        priceScore,
        typeScore,
        purposeScore,
        paymentScore,
        bedroomsScore,
        softScore,
      },
    };
  }
}
