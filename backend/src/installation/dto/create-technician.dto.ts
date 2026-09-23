import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  specialization?: string;
}
