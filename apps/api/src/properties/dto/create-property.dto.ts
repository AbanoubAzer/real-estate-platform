import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
// We would import Prisma enums here in a full app, but defining them temporarily for the DTO
enum Purpose {
  SALE = 'SALE',
  RENT = 'RENT',
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  propertyTypeId: string; // The configurable property type

  @IsEnum(Purpose)
  @IsNotEmpty()
  purpose: Purpose;

  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string = 'EGP';

  @IsNumber()
  @Min(1)
  area: number;

  @IsString()
  @IsOptional()
  unit?: string = 'SQM';

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  areaLocation: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsNumber()
  @IsOptional()
  buildingFloors?: number;

  @IsOptional()
  features?: any;

  @IsOptional()
  media?: any;
  
  @IsOptional()
  paymentPlans?: any;
  
  @IsOptional()
  status?: string; // e.g. DRAFT
}
