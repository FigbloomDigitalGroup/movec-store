import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryInstallationRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
