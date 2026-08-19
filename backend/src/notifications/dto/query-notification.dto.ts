import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryNotificationDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
