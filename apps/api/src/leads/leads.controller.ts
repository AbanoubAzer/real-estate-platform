import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /** Public Endpoint: Submit property inquiry / create lead (E11.1 & E11.2) */
  @Post()
  createLead(@Body() body: any) {
    return this.leadsService.createOrUpdateLead(body);
  }

  /** Public Endpoint: Submit specific inquiry for an existing property */
  @Post(':id/inquiries')
  submitInquiry(@Param('id') leadId: string, @Body() body: any) {
    return this.leadsService.createOrUpdateLead({
      ...body,
      phone: body.phone,
    });
  }

  // ─── Agent & Admin Protected Endpoints ──────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  getLeads(@Request() req, @Query('status') status?: string) {
    return this.leadsService.getAgentLeads(req.user.userId, status);
  }

  @Get('priority-queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  getPriorityQueue(@Request() req) {
    return this.leadsService.getPriorityQueue(req.user.userId);
  }

  @Get('analytics/funnel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  getConversionFunnel(@Request() req) {
    return this.leadsService.getConversionFunnel(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  getLead(@Param('id') id: string, @Request() req) {
    return this.leadsService.getLeadById(id, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('lostReason') lostReason: string,
    @Request() req
  ) {
    return this.leadsService.updateStatus(id, req.user.userId, status, lostReason);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  addNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req
  ) {
    return this.leadsService.addNote(id, req.user.userId, content);
  }

  @Post(':id/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  logActivity(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('notes') notes: string,
    @Request() req
  ) {
    return this.leadsService.logActivity(id, req.user.userId, type, notes);
  }
}
