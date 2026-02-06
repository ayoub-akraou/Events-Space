import { IsOptional, IsString } from 'class-validator';

export class AdminDecisionDto {
  @IsOptional()
  @IsString()
  adminNote?: string;
}
