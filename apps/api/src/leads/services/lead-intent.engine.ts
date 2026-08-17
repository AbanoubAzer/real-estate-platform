import { Injectable } from '@nestjs/common';

export interface LeadIntentResult {
  intent: 'BUY' | 'RENT' | 'INVEST' | 'COMPARE' | 'JUST_BROWSING';
  confidence: number; // 0.0 - 1.0
  conversionProbability: number; // 0.0 - 1.0 (e.g. 0.87 = 87%)
  reasonsAr: string[];
  reasonsEn: string[];
}

@Injectable()
export class LeadIntentEngine {
  /**
   * Analyzes user actions & inquiry history to detect Intent and predict conversion probability (E11.4 & E11.20).
   */
  analyzeIntent(lead: any, inquiries: any[] = [], activities: any[] = []): LeadIntentResult {
    let intent: LeadIntentResult['intent'] = 'BUY';
    let confidence = 0.8;
    const reasonsAr: string[] = [];
    const reasonsEn: string[] = [];

    const leadMsg = (lead.message || '').toLowerCase();
    const hasViewing = lead.viewings?.length > 0 || inquiries.some((i) => i.inquiryType === 'BOOK_VIEWING');
    const hasPricingReq = inquiries.some((i) => i.inquiryType === 'PRICING' || i.inquiryType === 'PAYMENT_PLAN');
    const hasWhatsApp = inquiries.some((i) => i.inquiryType === 'WHATSAPP') || activities.some((a) => a.type === 'WHATSAPP');

    // Intent Detection
    if (leadMsg.includes('استثمار') || leadMsg.includes('عائد') || lead.purpose === 'INVESTMENT') {
      intent = 'INVEST';
      confidence = 0.92;
      reasonsAr.push('العميل استفسر عن خطط العائد الاستثماري والتقسيط');
      reasonsEn.push('Customer inquired about investment yield and payment plans');
    } else if (leadMsg.includes('إيجار') || leadMsg.includes('ايجار') || lead.purpose === 'RENT') {
      intent = 'RENT';
      confidence = 0.90;
      reasonsAr.push('العميل يبحث عن وحدات للإيجار');
      reasonsEn.push('Customer looking for rental units');
    } else if (inquiries.length >= 3 && lead.propertyInterests?.length >= 3) {
      intent = 'COMPARE';
      confidence = 0.85;
      reasonsAr.push('العميل يقارن بين عدة عقارات مختلفة');
      reasonsEn.push('Customer comparing multiple properties');
    } else if (hasViewing || hasPricingReq) {
      intent = 'BUY';
      confidence = 0.95;
      reasonsAr.push('العميل طلب معاينة وتفاصيل أنظمة السداد');
      reasonsEn.push('Customer requested viewing and payment details');
    }

    // Conversion Probability Prediction (E11.20)
    let prob = 0.20; // Base probability

    if (hasViewing) prob += 0.35;
    if (hasPricingReq) prob += 0.20;
    if (hasWhatsApp) prob += 0.15;
    if (lead.score >= 80) prob += 0.15;

    const conversionProbability = Math.min(0.98, Math.max(0.10, prob));

    if (hasViewing) {
      reasonsAr.push('احتمالية تحويل عالية نظراً لحجز معاينة فعلية');
      reasonsEn.push('High conversion probability due to booked viewing');
    }

    return {
      intent,
      confidence,
      conversionProbability: Math.round(conversionProbability * 100) / 100,
      reasonsAr,
      reasonsEn,
    };
  }
}
