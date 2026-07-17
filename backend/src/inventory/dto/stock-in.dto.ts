import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class StockInDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reference?: string;
}