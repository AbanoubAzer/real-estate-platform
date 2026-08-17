import { Injectable } from '@nestjs/common';
import { AiParserService, ParsedSearchFilter } from './ai-parser.service';
import { PrismaService } from '../../database/prisma.service';
import { MatchScoreEngine } from './match-score.engine';

export interface ChatMessage {
  sender: 'user' | 'assistant';
  textAr: string;
  textEn: string;
  timestamp: string;
  extractedFilters?: ParsedSearchFilter;
  matchesCount?: number;
}

export interface ConversationalSession {
  sessionId: string;
  messages: ChatMessage[];
  currentFilters: ParsedSearchFilter;
  step: 'INITIAL' | 'PURPOSE' | 'BUDGET' | 'LOCATION' | 'RESULTS';
}

@Injectable()
export class ConversationalAiService {
  private sessions = new Map<string, ConversationalSession>();

  constructor(
    private aiParserService: AiParserService,
    private prisma: PrismaService,
    private matchScoreEngine: MatchScoreEngine,
  ) {}

  async processChatMessage(sessionId: string, userMessage: string): Promise<{
    session: ConversationalSession;
    matchedProperties: any[];
  }> {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        messages: [],
        currentFilters: {},
        step: 'INITIAL',
      };
      this.sessions.set(sessionId, session);
    }

    // Add user message
    session.messages.push({
      sender: 'user',
      textAr: userMessage,
      textEn: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Parse user input using AI parser
    const parsed = this.aiParserService.parseQuery(userMessage);

    // Merge new filters into current filters
    session.currentFilters = {
      ...session.currentFilters,
      ...parsed.filters,
    };

    // Query candidate properties count
    const properties = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      include: { propertyType: true, media: { where: { isCover: true } }, paymentPlans: true },
      take: 20,
    });

    const scored = properties.map((prop) => {
      const match = this.matchScoreEngine.calculateMatchScore(prop, session.currentFilters);
      return {
        ...prop,
        matchScore: match.matchScore,
        reasonsAr: match.reasonsAr,
        reasonsEn: match.reasonsEn,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scored.filter((p) => p.matchScore >= 60).slice(0, 4);

    // Generate Conversational Assistant Response
    let assistantAr = '';
    let assistantEn = '';

    if (!session.currentFilters.purpose) {
      session.step = 'PURPOSE';
      assistantAr = `ممتاز! تم استخراج البحث. هل تفضل الوحدة للسكن أم للاستثمار؟`;
      assistantEn = `Great! Search extracted. Is the unit intended for residential use or investment?`;
    } else if (!session.currentFilters.maxPrice && !session.currentFilters.downPayment) {
      session.step = 'BUDGET';
      assistantAr = `تمام! هل لديك ميزانية محددة أو حد أقصى للمقدم والتقسيط؟`;
      assistantEn = `Got it! Do you have a specific budget or maximum down payment in mind?`;
    } else if (!session.currentFilters.location || session.currentFilters.location.length === 0) {
      session.step = 'LOCATION';
      assistantAr = `عظيم! هل تفضل منطقة معينة (مثل الغردقة، التجمع الخامس، الشيخ زايد، أو العاصمة الإدارية)؟`;
      assistantEn = `Awesome! Do you prefer a specific location (e.g. Hurghada, New Cairo, Sheikh Zayed, New Capital)?`;
    } else {
      session.step = 'RESULTS';
      assistantAr = `وجدنا لك ${topMatches.length} عقارات تطابق احتياجاتك بنسبة تصل إلى ${topMatches[0]?.matchScore || 90}%! هل تفضل العائد الإيجاري الأعلى أم أقل مقدم؟`;
      assistantEn = `We found ${topMatches.length} properties matching your criteria up to ${topMatches[0]?.matchScore || 90}%! Do you prefer higher rental yield or lowest down payment?`;
    }

    session.messages.push({
      sender: 'assistant',
      textAr: assistantAr,
      textEn: assistantEn,
      timestamp: new Date().toISOString(),
      extractedFilters: session.currentFilters,
      matchesCount: topMatches.length,
    });

    return {
      session,
      matchedProperties: topMatches,
    };
  }
}
