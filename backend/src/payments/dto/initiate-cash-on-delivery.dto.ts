import { IsString } from 'class-validator';

export class InitiateCashOnDeliveryDto {
  @IsString()
  orderNumber: string;
}
