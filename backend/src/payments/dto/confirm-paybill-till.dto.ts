import { IsString } from 'class-validator';

export class ConfirmPaybillTillDto {
  @IsString()
  orderNumber: string;
}
