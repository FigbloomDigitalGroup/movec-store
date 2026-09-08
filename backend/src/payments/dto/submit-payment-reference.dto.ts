import { IsString, Length } from 'class-validator';

export class SubmitPaymentReferenceDto {
  @IsString()
  orderNumber: string;

  // The M-Pesa confirmation code the customer received by SMS (e.g. "QGH7XXXXX1") —
  // recorded only to help an admin reconcile the statement, never trusted on its
  // own to confirm the payment (see PaymentsService.submitPaymentReference).
  @IsString()
  @Length(1, 40)
  reference: string;
}
