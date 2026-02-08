import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  startAt: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsInt()
  @Min(1)
  capacityMax: number;

  @IsUUID()
  locationId: string;
}
