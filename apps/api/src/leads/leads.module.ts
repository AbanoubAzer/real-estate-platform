import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaService } from '../database/prisma.service';
import { LeadScoringEngine } from './services/lead-scoring.engine';
import { LeadIntentEngine } from './services/lead-intent.engine';
import { LeadAssignmentEngine } from './services/lead-assignment.engine';
import { AiFollowupAssistantService } from './services/ai-followup-assistant.service';

@Module({
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadScoringEngine,
    LeadIntentEngine,
    LeadAssignmentEngine,
    AiFollowupAssistantService,
    PrismaService,
  ],
  exports: [
    LeadsService,
    LeadScoringEngine,
    LeadIntentEngine,
    LeadAssignmentEngine,
    AiFollowupAssistantService,
  ],
})
export class LeadsModule {}
