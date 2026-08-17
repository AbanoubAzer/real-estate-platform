import { Injectable } from '@nestjs/common';

export interface FollowupSuggestion {
  templateAr: string;
  templateEn: string;
  contextSummaryAr: string;
  contextSummaryEn: string;
  recommendedChannel: 'WHATSAPP' | 'CALL' | 'EMAIL';
  suggestedDaysDelay: number;
}

@Injectable()
export class AiFollowupAssistantService {
  /**
   * Generates a context-aware Arabic follow-up message for agents (E11.9).
   */
  generateFollowupSuggestion(lead: any, propertyInterest?: any): FollowupSuggestion {
    const customerName = lead.name || 'العميل';
    const propTitle = propertyInterest?.title || 'العقار المطلوب';
    const budgetStr = lead.budgetMax ? `${(lead.budgetMax / 1000000).toFixed(1)}M` : '';

    let templateAr = '';
    let templateEn = '';
    let contextSummaryAr = '';
    let contextSummaryEn = '';

    if (lead.status === 'NEW') {
      templateAr = `أهلاً أ/ ${customerName}، يسعدنا تواصلك بخصوص ${propTitle}. هل تفضل إرسال الكتالوج وأنظمة السداد المتاحة عبر الواتساب؟`;
      templateEn = `Hello ${customerName}, thank you for inquiring about ${propTitle}. Would you like me to send the brochure and payment plans via WhatsApp?`;
      contextSummaryAr = `العميل مهتم بـ ${propTitle} وقام بإرسال استفسار حديث.`;
      contextSummaryEn = `New lead interested in ${propTitle}.`;
    } else if (lead.status === 'QUALIFIED' || lead.status === 'CONTACTED') {
      templateAr = `أهلاً أ/ ${customerName}، لدينا حالياً وحدتين متميزتين بنفس المواصفات في نطاق ميزانيتك ${budgetStr} ج.م. هل يناسبك تحديد موعد للمعاينة هذا الأسبوع؟`;
      templateEn = `Hello ${customerName}, we have 2 matching units in your budget range (${budgetStr} EGP). Would you like to schedule a viewing this week?`;
      contextSummaryAr = `العميل مؤهل بميزانية ${budgetStr} ج.م ويستحسن تقديم اقتراحات مشابهة.`;
      contextSummaryEn = `Qualified customer with ${budgetStr} EGP budget.`;
    } else if (lead.status === 'VIEWING_BOOKED' || lead.status === 'VIEWING') {
      templateAr = `أهلاً أ/ ${customerName}، نذكرك بموعد معاينة ${propTitle} القادم. يسعدنا الإجابة على أي استفسارات قبل الزيارة.`;
      templateEn = `Hello ${customerName}, reminding you of your upcoming viewing for ${propTitle}. Let us know if you have any questions.`;
      contextSummaryAr = `تذكير بموعد المعاينة المحجوز.`;
      contextSummaryEn = `Viewing appointment reminder.`;
    } else {
      templateAr = `أهلاً أ/ ${customerName}، تم إضافة وحدات جديدة بنفس المواصفات في ${propTitle}. يسعدنا اطلاعك عليها.`;
      templateEn = `Hello ${customerName}, new matching units are available. Let us know if you would like to review them.`;
      contextSummaryAr = `متابعة دورية لإعادة التفاعل.`;
      contextSummaryEn = `Re-engagement follow-up.`;
    }

    return {
      templateAr,
      templateEn,
      contextSummaryAr,
      contextSummaryEn,
      recommendedChannel: lead.phone ? 'WHATSAPP' : 'EMAIL',
      suggestedDaysDelay: lead.status === 'NEW' ? 0 : 2,
    };
  }

  /**
   * Generates automated follow-up schedule (Day 0, Day 2, Day 5, Day 10, Day 30) (E11.10).
   */
  getAutomationSchedule(lead: any) {
    return [
      { day: 0, titleAr: 'التواصل الأولي والترحيب', status: 'COMPLETED' },
      { day: 2, titleAr: 'تذكير وعرض أنظمة السداد', status: 'PENDING' },
      { day: 5, titleAr: 'اقتراح وحدات آلية مشابهة', status: 'PENDING' },
      { day: 10, titleAr: 'متابعة اهتمام العميل', status: 'PENDING' },
      { day: 30, titleAr: 'حملة إعادة تفاعل (Re-engagement)', status: 'PENDING' },
    ];
  }
}
