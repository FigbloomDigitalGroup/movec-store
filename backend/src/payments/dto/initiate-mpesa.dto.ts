import { IsString, Matches } from 'class-validator';

export class InitiateMpesaDto {
  @IsString()
  orderNumber: string;

  // Kenyan MSISDN in local (07/01xxxxxxxx) or international (+254/254xxxxxxxxx) form.
  // Without this, the field accepted any string, letting a caller point STK Push
  // prompts at an arbitrary third-party phone number with no rate limit.
  @IsString()
  @Matches(/^(?:\+?254|0)(7|1)\d{8}$/, {
    message: 'phoneNumber must be a valid Kenyan phone number',
  })
  phoneNumber: string;
}
