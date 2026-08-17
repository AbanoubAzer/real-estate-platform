import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ViewingsService } from './viewings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('viewings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AGENT', 'ADMIN')
export class ViewingsController {
  constructor(private readonly viewingsService: ViewingsService) {}

  @Get()
  getViewings(@Request() req) {
    return this.viewingsService.getAgentViewings(req.user.userId);
  }

  @Post()
  scheduleViewing(@Body() body: any, @Request() req) {
    return this.viewingsService.scheduleViewing({
      ...body,
      agentId: req.user.userId,
      scheduledAt: new Date(body.scheduledAt)
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('agentNotes') agentNotes: string,
    @Request() req
  ) {
    return this.viewingsService.updateStatus(id, req.user.userId, status, agentNotes);
  }

  @Post(':id/feedback')
  submitFeedback(@Param('id') id: string, @Body() dto: any) {
    return this.viewingsService.submitFeedback(id, dto);
  }
}
