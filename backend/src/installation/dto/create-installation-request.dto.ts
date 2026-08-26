import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { InstallationTimeSlot } from '@prisma/client';

export class CreateInstallationRequestDto {
  @IsString()
  serviceId: string;

  @IsDateString()
  preferredDate: string;

  @IsOptional()
  @IsEnum(InstallationTimeSlot)
  timeSlot?: InstallationTimeSlot;

  @IsString()
  addressId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
