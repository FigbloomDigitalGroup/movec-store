import { IsString } from 'class-validator';

export class MfaVerifyLoginDto {
  @IsString()
  mfaTicket: string;

  @IsString()
  code: string;
}
