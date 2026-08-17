import { Module } from '@nestjs/common';
import { PersonalizationController } from './personalization.controller';
import { UserPreferenceService } from './services/user-preference.service';
import { RecommendationRankingService } from './services/recommendation-ranking.service';
import { SavedSearchService } from './services/saved-search.service';
import { RecommendationFeedbackService } from './services/recommendation-feedback.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [PersonalizationController],
  providers: [
    UserPreferenceService,
    RecommendationRankingService,
    SavedSearchService,
    RecommendationFeedbackService,
    PrismaService,
  ],
  exports: [
    UserPreferenceService,
    RecommendationRankingService,
    SavedSearchService,
    RecommendationFeedbackService,
  ],
})
export class PersonalizationModule {}
