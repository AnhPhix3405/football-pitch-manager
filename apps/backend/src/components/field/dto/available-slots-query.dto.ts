import { ApiProperty } from '@nestjs/swagger';
import { IsIn, Matches } from 'class-validator';

export class AvailableSlotsQueryDto {
  @ApiProperty({ example: '2026-10-25', description: 'YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiProperty({ example: '7', enum: ['5', '7', '11'] })
  @IsIn(['5', '7', '11'])
  courtType!: string;
}
