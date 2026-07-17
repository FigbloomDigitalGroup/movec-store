import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class StockOutDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reference?: string;
}