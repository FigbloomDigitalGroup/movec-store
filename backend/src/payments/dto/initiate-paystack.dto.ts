import { IsString, IsEmail } from 'class-validator';

export class InitiatePaystackDto {
  @IsString()
  orderNumber: string;

  @IsEmail()
  email: string;
}
