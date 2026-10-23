import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class FieldPricingQueryDto {
  @ApiPropertyOptional({ example: '5', enum: ['5', '7', '11'] })
  @IsOptional()
  @IsIn(['5', '7', '11'])
  courtType?: string;

  @ApiPropertyOptional({
    example: 'weekday',
    enum: ['weekday', 'weekend', 'holiday'],
  })
  @IsOptional()
  @IsIn(['weekday', 'weekend', 'holiday'])
  dayType?: string;
}
