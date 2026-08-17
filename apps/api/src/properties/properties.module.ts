import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { MediaController } from './media.controller';
import { PrismaService } from '../database/prisma.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [PropertiesController, MediaController],
  providers: [PropertiesService, PrismaService],
})
export class PropertiesModule {}
