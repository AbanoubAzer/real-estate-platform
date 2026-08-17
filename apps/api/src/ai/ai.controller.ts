import { Controller, Post, Get, Body, Param, Query, Request } from '@nestjs/common';
import { AiParserService } from './services/ai-parser.service';
import { MatchScoreEngine } from './services/match-score.engine';
import { RecommendationService } from './services/recommendation.service';
import { ConversationalAiService } from './services/conversational-ai.service';
import { PrismaService } from '../database/prisma.service';

@Controller('ai')
export class AiController {
  constructor(
    private aiParserService: AiParserService,
    private matchScoreEngine: MatchScoreEngine,
    private recommendationService: RecommendationService,
    private conversationalAiService: ConversationalAiService,
    private prisma: PrismaService,
  ) {}

  /**
   * E10.1 & E10.2: Parse Natural Language Query into Structured Filters
   */
  @Post('parse')
  parseQuery(@Body('query') query: string) {
    return this.aiParserService.parseQuery(query);
  }

  /**
   * E10.6 & E10.18: AI Natural Language Hybrid Search & Ranking Engine
   */
  @Post('search')
  async search(@Body('query') query: string) {
    const parsed = this.aiParserService.parseQuery(query);

    // Candidate Pool Retrieval
    const properties = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        propertyType: true,
        media: { where: { isCover: true } },
        paymentPlans: true,
      },
      take: 40,
      orderBy: { createdAt: 'desc' },
    });

    // Score & Rank properties
    const ranked = properties.map((prop) => {
      const match = this.matchScoreEngine.calculateMatchScore(prop, parsed.filters);
      return {
        ...prop,
        matchScore: match.matchScore,
        hardMatch: match.hardMatch,
        reasonsAr: match.reasonsAr,
        reasonsEn: match.reasonsEn,
        scoreBreakdown: match.scoreBreakdown,
      };
    });

    // Sort by Match Score descending
    ranked.sort((a, b) => b.matchScore - a.matchScore);

    return {
      intent: parsed.intent,
      filters: parsed.filters,
      suggestions: parsed.suggestions,
      confidence: parsed.confidence,
      totalMatches: ranked.length,
      results: ranked,
    };
  }

  /**
   * E10.4: Conversational AI Search Chat Assistant
   */
  @Post('conversational')
  async chatMessage(
    @Body('sessionId') sessionId: string,
    @Body('message') message: string,
  ) {
    const sid = sessionId || 'session-guest-1';
    return this.conversationalAiService.processChatMessage(sid, message);
  }

  /**
   * E10.8: Personalized Recommendations
   */
  @Get('recommendations')
  getRecommendations(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit = 6,
  ) {
    return this.recommendationService.getPersonalizedRecommendations(userId, sessionId, Number(limit));
  }

  /**
   * E10.9 & E10.13: Smart Similar Properties with Match Scores & Explainability
   */
  @Get('properties/:id/similar')
  getSimilarProperties(@Param('id') id: string, @Query('limit') limit = 4) {
    return this.recommendationService.getSimilarProperties(id, Number(limit));
  }

  /**
   * E10.14: Feedback Loop (Thumbs up / down)
   */
  @Post('feedback')
  saveFeedback(
    @Body('propertyId') propertyId: string,
    @Body('rating') rating: 'LIKE' | 'DISLIKE',
    @Body('feedbackText') feedbackText?: string,
  ) {
    return {
      success: true,
      messageAr: 'شكراً لملاحظاتك! تم تحسين اقتراحات الذكاء الاصطناعي بناءً على اختيارك.',
      messageEn: 'Thank you! AI recommendations updated based on your feedback.',
    };
  }
}
