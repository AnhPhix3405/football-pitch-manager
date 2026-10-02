import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOwnerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessLicense?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccount?: string;
}
