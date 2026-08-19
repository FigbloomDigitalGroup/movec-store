import { IsString } from 'class-validator';

export class InitiateMpesaDto {
  @IsString()
  orderNumber: string;

  @IsString()
  phoneNumber: string;
}
