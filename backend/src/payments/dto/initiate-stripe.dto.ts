import { IsString } from 'class-validator';

export class InitiateStripeDto {
  @IsString()
  orderNumber: string;
}