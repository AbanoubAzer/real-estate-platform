import { Injectable } from '@nestjs/common';

export interface ParsedSearchFilter {
  location?: string[];
  propertyType?: string;
  purpose?: 'SALE' | 'RENT' | 'INVESTMENT';
  bedrooms?: { min?: number; max?: number };
  bathrooms?: { min?: number; max?: number };
  maxPrice?: number;
  minPrice?: number;
  downPayment?: number;
  paymentPlan?: { enabled: boolean; minYears?: number };
  seaView?: boolean;
  quietFamily?: boolean;
  furnished?: boolean;
  finishing?: string;
  investmentYield?: boolean;
}

export interface SmartSuggestion {
  filterKey: string;
  labelAr: string;
  labelEn: string;
  suggestedValue: any;
  reasonAr: string;
  reasonEn: string;
}

export interface ParsedQueryResult {
  intent: 'BUY' | 'RENT' | 'INVEST' | 'COMPARE' | 'DISCOVER' | 'PROPERTY_SEARCH';
  filters: ParsedSearchFilter;
  suggestions: SmartSuggestion[];
  extractedEntities: Record<string, any>;
  confidence: number;
}

@Injectable()
export class AiParserService {
  /**
   * Parses natural language query in Egyptian Arabic / English into structured filters and intent.
   * e.g., "عايز شقة في الغردقة قريبة من البحر غرفتين ومعايا 500 ألف مقدم والباقي أقساط"
   */
  parseQuery(query: string): ParsedQueryResult {
    if (!query || typeof query !== 'string') {
      return {
        intent: 'PROPERTY_SEARCH',
        filters: {},
        suggestions: [],
        extractedEntities: {},
        confidence: 0,
      };
    }

    const text = query.trim();
    const lower = text.toLowerCase();

    // 1. Intent Detection (E10.5)
    let intent: ParsedQueryResult['intent'] = 'PROPERTY_SEARCH';
    if (lower.includes('استثمار') || lower.includes('عائد') || lower.includes('invest')) {
      intent = 'INVEST';
    } else if (lower.includes('إيجار') || lower.includes('للايجار') || lower.includes('rent')) {
      intent = 'RENT';
    } else if (lower.includes('مقارنة') || lower.includes('مقارنه') || lower.includes('compare')) {
      intent = 'COMPARE';
    } else if (lower.includes('أرخص') || lower.includes('أفضل') || lower.includes('best') || lower.includes('cheapest')) {
      intent = 'DISCOVER';
    } else if (lower.includes('شراء') || lower.includes('للبيع') || lower.includes('عايز شقة') || lower.includes('buy')) {
      intent = 'BUY';
    }

    const filters: ParsedSearchFilter = {};
    const extractedEntities: Record<string, any> = {};

    // 2. Location Extraction
    const locations: string[] = [];
    const locationMap: Record<string, string> = {
      'الغردقة': 'Hurghada',
      'hurghada': 'Hurghada',
      'الجونة': 'El Gouna',
      'gouna': 'El Gouna',
      'التجمع': 'New Cairo',
      'التجمع الخامس': 'New Cairo',
      'القاهرة الجديدة': 'New Cairo',
      'cairo': 'Cairo',
      'القاهرة': 'Cairo',
      'الشيخ زايد': 'Sheikh Zayed',
      'زايد': 'Sheikh Zayed',
      'zayed': 'Sheikh Zayed',
      '6 أكتوبر': '6th of October',
      'أكتوبر': '6th of October',
      'مدينتي': 'Madinaty',
      'العاصمة الإدارية': 'New Capital',
      'العاصمة': 'New Capital',
      'الأسكندرية': 'Alexandria',
      'إسكندرية': 'Alexandria',
      'معادي': 'Maadi',
      'المعادي': 'Maadi',
      'سهل حشيش': 'Sahl Hasheesh',
    };

    for (const [key, val] of Object.entries(locationMap)) {
      if (lower.includes(key.toLowerCase())) {
        if (!locations.includes(val)) locations.push(val);
      }
    }
    if (locations.length > 0) {
      filters.location = locations;
      extractedEntities.location = locations;
    }

    // 3. Property Type Extraction
    if (lower.includes('فيلا') || lower.includes('villa')) {
      filters.propertyType = 'Villa';
      extractedEntities.propertyType = 'Villa';
    } else if (lower.includes('شقة') || lower.includes('شقه') || lower.includes('apartment')) {
      filters.propertyType = 'Apartment';
      extractedEntities.propertyType = 'Apartment';
    } else if (lower.includes('مكتب') || lower.includes('office')) {
      filters.propertyType = 'Office';
      extractedEntities.propertyType = 'Office';
    } else if (lower.includes('شاليه') || lower.includes('chalet')) {
      filters.propertyType = 'Chalet';
      extractedEntities.propertyType = 'Chalet';
    } else if (lower.includes('دوبلكس') || lower.includes('duplex')) {
      filters.propertyType = 'Duplex';
      extractedEntities.propertyType = 'Duplex';
    } else if (lower.includes('توين هاوس') || lower.includes('twin house')) {
      filters.propertyType = 'Twin House';
      extractedEntities.propertyType = 'Twin House';
    }

    // 4. Purpose Extraction
    if (intent === 'RENT' || lower.includes('إيجار') || lower.includes('للايجار')) {
      filters.purpose = 'RENT';
      extractedEntities.purpose = 'RENT';
    } else if (intent === 'INVEST' || lower.includes('استثمار')) {
      filters.purpose = 'INVESTMENT';
      extractedEntities.purpose = 'INVESTMENT';
    } else {
      filters.purpose = 'SALE';
      extractedEntities.purpose = 'SALE';
    }

    // 5. Bedrooms Extraction
    const bedMatch = text.match(/(\d+)\s*(غرف|غرفة|غرفتين|bedroom|bed|beds)/i) ||
                     text.match(/(غرفتين)/i);
    if (bedMatch) {
      let count = 2;
      if (bedMatch[1] === 'غرفتين') count = 2;
      else if (bedMatch[1]) count = parseInt(bedMatch[1], 10);
      if (!isNaN(count)) {
        filters.bedrooms = { min: count };
        extractedEntities.bedrooms = count;
      }
    } else if (lower.includes('غرفتين') || lower.includes('2غرفة') || lower.includes('2 غرف')) {
      filters.bedrooms = { min: 2 };
      extractedEntities.bedrooms = 2;
    } else if (lower.includes('3 غرف') || lower.includes('ثلاث غرف')) {
      filters.bedrooms = { min: 3 };
      extractedEntities.bedrooms = 3;
    } else if (lower.includes('ستوديو') || lower.includes('studio')) {
      filters.bedrooms = { min: 1, max: 1 };
      extractedEntities.bedrooms = 1;
    }

    // 6. Price / Budget Parsing (Millions / Thousands)
    const millionMatch = text.match(/(\d+(?:\.\d+)?)\s*(مليون|m|million)/i);
    const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(ألف|الف|k|thousand)/i);

    if (millionMatch) {
      const val = parseFloat(millionMatch[1]) * 1000000;
      if (lower.includes('مقدم') || lower.includes('دفعة أُولى')) {
        filters.downPayment = val;
        extractedEntities.downPayment = val;
      } else {
        filters.maxPrice = val;
        extractedEntities.maxPrice = val;
      }
    } else if (thousandMatch) {
      const val = parseFloat(thousandMatch[1]) * 1000;
      if (lower.includes('مقدم') || lower.includes('دفعة أُولى')) {
        filters.downPayment = val;
        extractedEntities.downPayment = val;
      } else {
        filters.maxPrice = val;
        extractedEntities.maxPrice = val;
      }
    }

    // 7. Payment Plan / Installments
    if (lower.includes('تقسيط') || lower.includes('أقساط') || lower.includes('اقساط') || lower.includes('installment')) {
      const yearsMatch = text.match(/(\d+)\s*(سنوات|سنين|سنة|سنوات|years|yrs)/i);
      const minYears = yearsMatch ? parseInt(yearsMatch[1], 10) : 3;
      filters.paymentPlan = { enabled: true, minYears };
      extractedEntities.paymentPlan = { enabled: true, minYears };
    }

    // 8. Soft Preferences / Features (Sea View, Quiet/Family)
    if (lower.includes('بحر') || lower.includes('شاطئ') || lower.includes('sea') || lower.includes('beach')) {
      filters.seaView = true;
      extractedEntities.seaView = true;
    }
    if (lower.includes('هادي') || lower.includes('هادئ') || lower.includes('عائلة') || lower.includes('عائلي') || lower.includes('سكن')) {
      filters.quietFamily = true;
      extractedEntities.quietFamily = true;
    }
    if (lower.includes('مفروش') || lower.includes('furnished')) {
      filters.furnished = true;
      extractedEntities.furnished = true;
    }
    if (lower.includes('استثمار') || lower.includes('عائد')) {
      filters.investmentYield = true;
      extractedEntities.investmentYield = true;
    }

    // 9. Smart Filter Suggestions (E10.3)
    const suggestions: SmartSuggestion[] = [];
    if (intent === 'INVEST' || filters.investmentYield) {
      suggestions.push({
        filterKey: 'expectedRentalYield',
        labelAr: 'العائد الإيجاري المتوقع (> 8%)',
        labelEn: 'Expected Rental Yield (> 8%)',
        suggestedValue: 8,
        reasonAr: 'أقرحنا هذا الفلتر لتعظيم العائد الاستثماري لمشروعك',
        reasonEn: 'Suggested to maximize investment ROI for your query',
      });
      suggestions.push({
        filterKey: 'deliveryDate',
        labelAr: 'استلام فوري / سنة قادمة',
        labelEn: 'Immediate / 1 Year Delivery',
        suggestedValue: '1_YEAR',
        reasonAr: 'العقارات سريعة الاستلام تحقق عائداً أسرع',
        reasonEn: 'Fast delivery properties generate faster rental income',
      });
    }

    if (filters.seaView) {
      suggestions.push({
        filterKey: 'finishingStatus',
        labelAr: 'تشطيب كامل (Ultra Super Lux)',
        labelEn: 'Fully Finished (Ultra Super Lux)',
        suggestedValue: 'FULLY_FINISHED',
        reasonAr: 'الوحدات الشاطئية ذات التشطيب الكامل أسهل للإيجار السياحي',
        reasonEn: 'Fully finished beach units are easiest for holiday rentals',
      });
    }

    return {
      intent,
      filters,
      suggestions,
      extractedEntities,
      confidence: Object.keys(extractedEntities).length > 0 ? 0.92 : 0.6,
    };
  }
}
