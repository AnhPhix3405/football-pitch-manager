import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryReviewDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại (mặc định: 1)',
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng đánh giá mỗi trang (mặc định: 10)',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo số sao đánh giá (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}
