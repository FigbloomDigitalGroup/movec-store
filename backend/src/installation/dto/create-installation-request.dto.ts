import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateInstallationRequestDto {
  @IsString()
  serviceId: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  addressId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}