import { IsString } from 'class-validator';

export class ConfirmMfaSetupDto {
  @IsString()
  code: string;
}
