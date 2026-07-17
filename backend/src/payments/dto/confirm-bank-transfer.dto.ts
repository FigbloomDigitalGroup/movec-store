import { IsString } from 'class-validator';

export class ConfirmBankTransferDto {
  @IsString()
  orderNumber: string;
}