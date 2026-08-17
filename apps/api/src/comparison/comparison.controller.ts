import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ComparisonService } from './services/comparison.service';
import { AiComparisonEngine } from './services/ai-comparison.engine';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';

@Controller('comparisons')
export class ComparisonController {
  constructor(
    private readonly comparisonService: ComparisonService,
    private readonly aiEngine: AiComparisonEngine,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async createComparison(@Request() req, @Body() body: { propertyIds: string[] }) {
    // Optional auth
    const userId = req.user?.userId || null;
    return this.comparisonService.createComparison(userId, body.propertyIds);
  }

  @Get(':id')
  async getComparison(@Param('id') id: string) {
    const { comparison, properties } = await this.comparisonService.getComparison(id);
    
    // Check if user has an intent from preferences (Mocking user intent fetching)
    const userIntent = 'LIVING';

    const aiAnalysis = await this.aiEngine.generateComparisonAnalysis(
      properties, 
      comparison.criteriaWeights, 
      userIntent
    );

    return {
      comparison,
      properties,
      aiAnalysis,
    };
  }

  @Get('shared/:token')
  async getSharedComparison(@Param('token') token: string) {
    const { comparison, properties } = await this.comparisonService.getComparisonByShareToken(token);
    
    const aiAnalysis = await this.aiEngine.generateComparisonAnalysis(
      properties, 
      comparison.criteriaWeights, 
      'LIVING'
    );

    return {
      comparison,
      properties,
      aiAnalysis,
    };
  }

  @Post(':id/properties')
  async addProperty(@Param('id') id: string, @Body() body: { propertyId: string }) {
    return this.comparisonService.addProperty(id, body.propertyId);
  }

  @Delete(':id/properties/:propertyId')
  async removeProperty(@Param('id') id: string, @Param('propertyId') propertyId: string) {
    return this.comparisonService.removeProperty(id, propertyId);
  }

  @Post(':id/weights')
  async updateWeights(@Param('id') id: string, @Body() weights: any) {
    return this.comparisonService.updateWeights(id, weights);
  }

  @Post(':id/ask')
  async askQuestion(@Param('id') id: string, @Body() body: { question: string }) {
    const { properties } = await this.comparisonService.getComparison(id);
    const answer = await this.aiEngine.answerQuestion(properties, body.question);
    return { answer };
  }

  @Post(':id/feedback')
  async submitFeedback(@Request() req, @Param('id') id: string, @Body() body: { isHelpful: boolean, missingInfo: string[], comment?: string }) {
    const userId = req.user?.userId || null;
    return this.comparisonService.submitFeedback(id, userId, body.isHelpful, body.missingInfo, body.comment);
  }
}
