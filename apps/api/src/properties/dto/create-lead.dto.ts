import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum LeadType {
  CASH = 'CASH',
  INSTALLMENTS = 'INSTALLMENTS',
}

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
