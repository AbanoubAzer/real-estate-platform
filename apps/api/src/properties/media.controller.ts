import { Controller, Post, Param, UseInterceptors, UploadedFiles, Body, Patch, Delete, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { StorageService } from '../storage/storage.service';

@Controller('properties/:id/media')
export class MediaController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly storageService: StorageService
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  }))
  async uploadMedia(
    @Param('id') propertyId: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedMedia: any[] = [];
    
    for (const file of files) {
      // 1. Validate file extension (AC1)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Unsupported file type: ${file.originalname}`);
      }
      
      // 2. Validate actual image via Magic Numbers (AC3)
      const magicNumbers = file.buffer.toString('hex', 0, 4).toUpperCase();
      const isJpeg = magicNumbers.startsWith('FFD8FF');
      const isPng = magicNumbers.startsWith('89504E47');
      const isWebp = magicNumbers.startsWith('52494646'); // RIFF
      
      if (!isJpeg && !isPng && !isWebp) {
        throw new BadRequestException(`File is not a valid image: ${file.originalname}`);
      }

      // 3. Upload to Storage
      const url = await this.storageService.uploadFile(file, propertyId);
      
      // 4. Save to Database
      const media = await this.propertiesService.addMedia(propertyId, {
        type: 'IMAGE',
        url,
        status: 'ACTIVE',
      });
      
      uploadedMedia.push(media);
    }

    return uploadedMedia;
  }

  @Post('video')
  async addVideoUrl(
    @Param('id') propertyId: string,
    @Body('url') url: string
  ) {
    // Basic validation for phase 1 (PMD-05)
    if (!url.includes('youtube.com') && !url.includes('vimeo.com')) {
      throw new BadRequestException('Only YouTube or Vimeo URLs are supported in Phase 1');
    }

    return this.propertiesService.addMedia(propertyId, {
      type: 'VIDEO',
      url,
      status: 'ACTIVE',
    });
  }

  @Patch('reorder')
  async reorderMedia(
    @Param('id') propertyId: string,
    @Body('order') order: { id: string; sortOrder: number }[]
  ) {
    return this.propertiesService.reorderMedia(propertyId, order);
  }

  @Patch(':mediaId/cover')
  async setCoverImage(
    @Param('id') propertyId: string,
    @Param('mediaId') mediaId: string
  ) {
    return this.propertiesService.setCoverImage(propertyId, mediaId);
  }

  @Delete(':mediaId')
  async deleteMedia(
    @Param('id') propertyId: string,
    @Param('mediaId') mediaId: string
  ) {
    const media = await this.propertiesService.removeMedia(propertyId, mediaId);
    await this.storageService.deleteFile(media.url);
    return { success: true };
  }
}
