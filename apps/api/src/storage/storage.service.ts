import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // Ready for Phase 2

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly useS3 = process.env.AWS_ACCESS_KEY_ID ? true : false;
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!this.useS3) {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        this.logger.log('Created local uploads directory');
      }
    }
  }

  async uploadFile(file: Express.Multer.File, propertyId: string): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${propertyId}-${uuidv4()}${fileExt}`;

    if (this.useS3) {
      // Phase 2: S3 Implementation
      this.logger.log(`[Mock S3] Uploading ${uniqueFilename} to S3 bucket...`);
      // const client = new S3Client({ region: process.env.AWS_REGION });
      // await client.send(new PutObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: uniqueFilename, Body: file.buffer }));
      return `https://mock-s3-bucket.s3.amazonaws.com/${uniqueFilename}`;
    } else {
      // Local Disk implementation for current dev phase without Docker
      const filePath = path.join(this.uploadDir, uniqueFilename);
      await fs.promises.writeFile(filePath, file.buffer);
      this.logger.log(`File saved locally: ${filePath}`);
      // Return a relative URL that our API will serve statically
      return `/uploads/${uniqueFilename}`;
    }
  }

  async deleteFile(url: string): Promise<void> {
    if (this.useS3) {
      // Phase 2: S3 Delete
      this.logger.log(`[Mock S3] Deleting ${url} from S3 bucket...`);
    } else {
      // Local Delete
      try {
        const filename = url.replace('/uploads/', '');
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (e) {
        this.logger.error(`Failed to delete local file: ${url}`, e);
      }
    }
  }
}
