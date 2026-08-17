import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('properties/pending')
  getPendingProperties() {
    return this.adminService.getPendingProperties();
  }

  @Post('properties/:id/verify')
  verifyProperty(
    @Param('id') id: string,
    @Body('action') action: 'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED',
    @Body('notes') notes: string,
    @Body('reason') reason: string,
    @Request() req
  ) {
    return this.adminService.verifyProperty(id, req.user.userId, action, notes, reason);
  }
}
