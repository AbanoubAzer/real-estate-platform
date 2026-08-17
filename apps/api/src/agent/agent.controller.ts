import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AGENT', 'ADMIN')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('dashboard')
  getDashboardStats(@Request() req) {
    return this.agentService.getDashboardStats(req.user.userId);
  }

  @Get('properties')
  getProperties(@Request() req) {
    return this.agentService.getProperties(req.user.userId);
  }
}
