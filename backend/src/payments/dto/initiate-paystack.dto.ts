import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class InitiatePaystackDto {
  @IsString()
  orderNumber: string;

  @IsEmail()
  email: string;

  // When true, this charges only the cash-on-delivery deposit amount for the
  // order (not its full total) — see PaymentsService.initiatePaystack.
  @IsOptional()
  @IsBoolean()
  codDeposit?: boolean;
}
