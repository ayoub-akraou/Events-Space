import { IsInt, IsISO8601, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityMax?: number;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}
