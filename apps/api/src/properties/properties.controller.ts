import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  @Post(':id/submit')
  submitForReview(@Param('id') id: string, @Request() req) {
    return this.propertiesService.submitForReview(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // usually only admins publish
  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.propertiesService.publish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'ADMIN')
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Request() req) {
    return this.propertiesService.duplicate(id, req.user.userId);
  }

  // Advanced Search & Smart Matching (Epic 5)
  @Post('search/ai')
  async aiSearch(@Body('query') query: string) {
    const { AiSearchService } = require('../search/ai-search.service');
    const aiService = new AiSearchService();
    return aiService.processQuery(query);
  }

  @Post('saved-searches')
  saveSearch(
    @Body('userId') userId: string,
    @Body('name') name: string,
    @Body('filters') filters: any,
  ) {
    return this.propertiesService.saveSearch(userId, name, filters);
  }

  @Get('saved-searches/:userId')
  getSavedSearches(@Param('userId') userId: string) {
    return this.propertiesService.getSavedSearches(userId);
  }

  // Epic 4: Favorites and Reporting
  @Post(':id/favorite')
  toggleFavorite(@Param('id') id: string, @Body('userId') userId: string) {
    // In real app, userId comes from JWT
    return this.propertiesService.toggleFavorite(id, userId || 'mock-user-id');
  }

  @Post(':id/report')
  reportProperty(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('reason') reason: string,
    @Body('details') details: string,
  ) {
    return this.propertiesService.reportProperty(
      id,
      userId || 'mock-user-id',
      reason,
      details,
    );
  }

  @Get('favorites/:userId')
  getFavorites(@Param('userId') userId: string) {
    return this.propertiesService.getFavorites(userId);
  }

  @Get()
  findAll(@Query() searchDto: SearchPropertyDto) {
    return this.propertiesService.findAll(searchDto);
  }

  // PD-13 Similar Properties
  @Get(':id/similar')
  findSimilar(@Param('id') id: string) {
    return this.propertiesService.findSimilar(id);
  }

  // PD-14 Track Views
  @Post(':id/view')
  trackView(
    @Param('id') id: string,
    @Body('sessionId') sessionId: string,
    @Body('source') source?: string,
  ) {
    return this.propertiesService.trackView(id, sessionId, source);
  }

  // PD-09, PD-10 Lead Generation
  @Post(':id/leads')
  createLead(
    @Param('id') id: string,
    @Body() createLeadDto: any, // Using 'any' here temporarily to avoid full import refactor, will use DTO in service
  ) {
    return this.propertiesService.createLead(id, createLeadDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
