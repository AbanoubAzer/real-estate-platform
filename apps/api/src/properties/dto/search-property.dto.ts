import { IsOptional, IsString, IsEnum, IsNumber, Min, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Purpose } from '@prisma/client';

export class SearchPropertyDto {
  @IsOptional()
  @IsString()
  q?: string; // Keyword search

  @IsOptional()
  @IsEnum(Purpose)
  purpose?: Purpose;

  @IsOptional()
  @IsString()
  propertyTypeId?: string;

  @IsOptional()
  @IsString()
  city?: string;



  // Financial Filters
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDownPayment?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxMonthlyInstallment?: number;

  // Investment
  @IsOptional()
  @IsString()
  investmentType?: string;

  @IsOptional()
  @IsString()
  areaLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  features?: string[]; // Array of feature IDs or names

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area_desc' | 'area_asc' | 'match_score';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
