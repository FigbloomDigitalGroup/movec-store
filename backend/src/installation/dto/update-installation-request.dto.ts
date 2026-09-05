import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { InstallationStatus, InstallationTimeSlot } from '@prisma/client';

export class UpdateInstallationRequestDto {
  @IsOptional()
  @IsEnum(InstallationStatus)
  status?: InstallationStatus;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsNumber()
  finalPrice?: number;

  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @IsOptional()
  @IsEnum(InstallationTimeSlot)
  timeSlot?: InstallationTimeSlot;
}
