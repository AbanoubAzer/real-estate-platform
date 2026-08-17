import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [AgentService, PrismaService],
  controllers: [AgentController]
})
export class AgentModule {}
