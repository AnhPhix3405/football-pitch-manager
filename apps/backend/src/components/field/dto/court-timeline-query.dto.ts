import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, Matches } from 'class-validator';

export class CourtTimelineQueryDto {
  @ApiProperty({ example: '2026-10-25', description: 'YYYY-MM-DD' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date!: string;

  @ApiPropertyOptional({ example: '843f0d8e-72f5-4a4d-9a3f-b5eb4923cbad' })
  @IsOptional()
  @IsUUID('4')
  courtId?: string;
}
