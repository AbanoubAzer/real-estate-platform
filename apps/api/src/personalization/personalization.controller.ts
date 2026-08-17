import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPreferenceService } from './services/user-preference.service';
import { RecommendationRankingService } from './services/recommendation-ranking.service';
import { SavedSearchService } from './services/saved-search.service';
import { RecommendationFeedbackService } from './services/recommendation-feedback.service';
import { PrismaService } from '../database/prisma.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class PersonalizationController {
  constructor(
    private readonly userPrefService: UserPreferenceService,
    private readonly rankingService: RecommendationRankingService,
    private readonly savedSearchService: SavedSearchService,
    private readonly feedbackService: RecommendationFeedbackService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Preferences (E11.1 & E11.2) ──────────────────────────────────────────

  @Get('preferences')
  getPreferences(@Request() req) {
    return this.userPrefService.getPreferences(req.user.userId);
  }

  @Patch('preferences')
  updatePreferences(@Request() req, @Body() body: any) {
    return this.userPrefService.updateExplicitPreferences(req.user.userId, body);
  }

  // ─── Personalized Recommendations (E11.13 & E11.14) ───────────────────────

  @Get('recommendations')
  getRecommendations(@Request() req) {
    return this.rankingService.getPersonalizedFeed(req.user.userId);
  }

  // ─── Recently Viewed (E11.5) ──────────────────────────────────────────────

  @Get('recently-viewed')
  getRecentlyViewed(@Request() req, @Query('limit') limit?: string) {
    return this.userPrefService.getRecentlyViewed(req.user.userId, limit ? parseInt(limit) : 10);
  }

  @Post('recently-viewed/:propertyId')
  recordView(@Request() req, @Param('propertyId') propertyId: string) {
    return this.userPrefService.recordView(req.user.userId, propertyId);
  }

  // ─── Continue Exploring (E11.6) ───────────────────────────────────────────

  @Get('continue-exploring')
  getContinueExploring(@Request() req) {
    return this.userPrefService.getContinueExploring(req.user.userId);
  }

  // ─── Favorites (E11.7 & E11.8) ───────────────────────────────────────────

  @Get('favorites')
  async getFavorites(@Request() req) {
    return this.prisma.favorite.findMany({
      where: { userId: req.user.userId },
      include: {
        property: {
          include: {
            media: { where: { isCover: true } },
            propertyType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('favorites/:propertyId')
  async addFavorite(@Request() req, @Param('propertyId') propertyId: string) {
    // Get current property price for E11.11 tracking
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    return this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId: req.user.userId, propertyId } },
      update: {},
      create: {
        userId: req.user.userId,
        propertyId,
        priceAtFavorite: property?.price,
      },
    });
  }

  @Delete('favorites/:propertyId')
  async removeFavorite(@Request() req, @Param('propertyId') propertyId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId: req.user.userId, propertyId },
    });
    return { success: true };
  }

  // ─── Saved Searches (E11.9 & E11.10) ─────────────────────────────────────

  @Get('saved-searches')
  getSavedSearches(@Request() req) {
    return this.savedSearchService.getSavedSearches(req.user.userId);
  }

  @Post('saved-searches')
  saveSearch(@Request() req, @Body() body: { name: string; filters: any }) {
    return this.savedSearchService.saveSearch(req.user.userId, body.name, body.filters);
  }

  @Delete('saved-searches/:id')
  deleteSearch(@Request() req, @Param('id') id: string) {
    return this.savedSearchService.deleteSearch(req.user.userId, id);
  }

  // ─── Recommendation Feedback (E11.17 & E11.18) ───────────────────────────

  @Post('recommendations/:propertyId/feedback')
  submitFeedback(
    @Request() req,
    @Param('propertyId') propertyId: string,
    @Body('feedbackType') feedbackType: string,
  ) {
    return this.feedbackService.submitFeedback(req.user.userId, propertyId, feedbackType);
  }

  @Post('properties/:propertyId/not-interested')
  markNotInterested(
    @Request() req,
    @Param('propertyId') propertyId: string,
    @Body('reason') reason?: string,
  ) {
    return this.feedbackService.markNotInterested(req.user.userId, propertyId, reason);
  }

  // ─── Personalization Controls (E11.16 & E11.28) ──────────────────────────

  @Patch('personalization')
  togglePersonalization(@Request() req, @Body('enabled') enabled: boolean) {
    return this.userPrefService.togglePersonalization(req.user.userId, enabled);
  }

  @Post('personalization/reset')
  resetPreferences(@Request() req) {
    return this.userPrefService.resetPreferences(req.user.userId);
  }

  // ─── Smart Alternatives (E11.25 & E11.26) ────────────────────────────────

  @Post('smart-alternatives')
  getSmartAlternatives(@Request() req, @Body() filters: any) {
    return this.rankingService.getSmartAlternatives(req.user.userId, filters);
  }
}
