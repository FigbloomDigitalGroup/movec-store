import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class InitiatePaybillTillDto {
  @IsString()
  orderNumber: string;

  // When true, this charges only the cash-on-delivery deposit amount for the
  // order (not its full total) — see PaymentsService.initiatePaybillTill.
  @IsOptional()
  @IsBoolean()
  codDeposit?: boolean;
}
