import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiParserService } from './services/ai-parser.service';
import { MatchScoreEngine } from './services/match-score.engine';
import { RecommendationService } from './services/recommendation.service';
import { ConversationalAiService } from './services/conversational-ai.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [AiController],
  providers: [
    AiParserService,
    MatchScoreEngine,
    RecommendationService,
    ConversationalAiService,
    PrismaService,
  ],
  exports: [
    AiParserService,
    MatchScoreEngine,
    RecommendationService,
    ConversationalAiService,
  ],
})
export class AiModule {}
