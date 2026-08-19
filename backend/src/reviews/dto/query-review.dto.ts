import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryReviewDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'all' | 'pending' | 'approved';

  @IsOptional()
  @IsNumberString()
  rating?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
