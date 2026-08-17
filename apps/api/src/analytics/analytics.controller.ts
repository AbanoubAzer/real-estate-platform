import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(
    @Body('sessionId') sessionId: string,
    @Body('eventType') eventType: string,
    @Body('propertyId') propertyId?: string,
    @Body('metadata') metadata?: any
  ) {
    if (!sessionId) return { success: false, message: 'No sessionId provided' };
    return this.analyticsService.trackEvent(sessionId, eventType, propertyId, metadata);
  }

  @Get('recent-searches/:sessionId')
  getRecentSearches(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getRecentSearches(sessionId);
  }

  @Get('last-viewed/:sessionId')
  getLastViewedProperty(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getLastViewedProperty(sessionId);
  }
}
