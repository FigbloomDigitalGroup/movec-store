import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

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
}
