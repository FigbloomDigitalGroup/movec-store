import { IsString, IsOptional } from 'class-validator';

export class CheckoutDto {
  @IsString()
  shippingAddressId: string;

  @IsString()
  billingAddressId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}