import { Injectable } from '@nestjs/common';
// PaymentMethod is now a plain string field, not an enum

@Injectable()
export class AiSearchService {
  /**
   * Mocks an AI provider extracting structured JSON from natural language.
   * e.g., "عايز شقة 3 غرف في التجمع للسكن، كاش لحد 4 مليون"
   */
  async processQuery(query: string): Promise<any> {
    // Artificial delay to simulate LLM latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowercaseQuery = query.toLowerCase();
    
    // Very basic keyword mock mapping
    const filters: any = {};

    if (lowercaseQuery.includes('شقة') || lowercaseQuery.includes('apartment')) {
      // We don't have the exact ID here, so we return the name, and the controller/service
      // will need to map this to the correct ID, or we just pass text filters
      filters.typeKeyword = 'شقة';
    }

    if (lowercaseQuery.includes('تجمع') || lowercaseQuery.includes('cairo')) {
      filters.city = 'New Cairo';
    }

    if (lowercaseQuery.includes('3 غرف') || lowercaseQuery.includes('3 bedrooms')) {
      filters.minBedrooms = 3;
    }

    if (lowercaseQuery.includes('كاش') || lowercaseQuery.includes('cash')) {
      filters.paymentMethod = 'CASH';
    }

    if (lowercaseQuery.includes('تقسيط') || lowercaseQuery.includes('installments')) {
      filters.paymentMethod = 'INSTALLMENTS';
    }

    // Attempt to extract numbers for budget (very basic mock)
    const millionsMatch = query.match(/(\d+)\s*(مليون|m|million)/i);
    if (millionsMatch) {
      filters.maxPrice = parseInt(millionsMatch[1]) * 1000000;
    }

    return filters;
  }
}
