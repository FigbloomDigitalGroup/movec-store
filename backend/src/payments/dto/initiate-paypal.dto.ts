import { IsString } from 'class-validator';

export class InitiatePaypalDto {
  @IsString()
  orderNumber: string;
}
