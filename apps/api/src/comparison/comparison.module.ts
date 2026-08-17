import { Module } from '@nestjs/common';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './services/comparison.service';
import { AiComparisonEngine } from './services/ai-comparison.engine';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [ComparisonController],
  providers: [
    ComparisonService,
    AiComparisonEngine,
    PrismaService,
  ],
  exports: [ComparisonService, AiComparisonEngine],
})
export class ComparisonModule {}
