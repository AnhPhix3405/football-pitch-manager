import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, Matches } from 'class-validator';

export class PriceQuoteQueryDto {
  @ApiProperty({ example: '5', enum: ['5', '7', '11'] })
  @IsIn(['5', '7', '11'])
  courtType!: string;

  @ApiProperty({ example: '2026-10-25', description: 'YYYY-MM-DD' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date!: string;

  @ApiProperty({ example: '16:00', description: 'HH:mm' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime!: string;

  @ApiProperty({ example: '18:00', description: 'HH:mm' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime!: string;
}
