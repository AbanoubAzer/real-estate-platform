import { Module } from '@nestjs/common';
import { ViewingsService } from './viewings.service';
import { ViewingsController } from './viewings.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [ViewingsService, PrismaService],
  controllers: [ViewingsController]
})
export class ViewingsModule {}
