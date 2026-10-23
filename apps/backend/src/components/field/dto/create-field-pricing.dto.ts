import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, Matches, Min } from 'class-validator';

export class CreateFieldPricingDto {
  @ApiProperty({ example: '5', enum: ['5', '7', '11'] })
  @IsIn(['5', '7', '11'])
  courtType!: string;

  @ApiProperty({ example: 'weekday', enum: ['weekday', 'weekend', 'holiday'] })
  @IsIn(['weekday', 'weekend', 'holiday'])
  dayType!: string;

  @ApiProperty({ example: '06:00', description: 'HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be formatted as HH:mm',
  })
  startTime!: string;

  @ApiProperty({ example: '17:00', description: 'HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be formatted as HH:mm',
  })
  endTime!: string;

  @ApiProperty({ example: 200000, description: 'Price in VND per hour' })
  @IsNumber()
  @Min(0)
  price!: number;
}
