import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  codEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  codDepositThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  codDepositPercentage?: number;

  @IsOptional()
  @IsBoolean()
  paybillEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  paybillNumber?: string;

  @IsOptional()
  @IsBoolean()
  tillEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tillNumber?: string;
}
