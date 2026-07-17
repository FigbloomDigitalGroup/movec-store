import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { InstallationStatus } from '@prisma/client';

export class UpdateInstallationRequestDto {
  @IsOptional()
  @IsEnum(InstallationStatus)
  status?: InstallationStatus;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  finalPrice?: number;
}