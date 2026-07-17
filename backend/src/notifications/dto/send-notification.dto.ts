import { IsString, IsOptional } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;
}