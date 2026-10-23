import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class BlockedSlotQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc chính xác theo ngày khóa (YYYY-MM-DD)',
    example: '2026-10-25',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày phải có định dạng YYYY-MM-DD',
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu khoảng lọc (YYYY-MM-DD)',
    example: '2026-10-20',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc khoảng lọc (YYYY-MM-DD)',
    example: '2026-10-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD',
  })
  endDate?: string;
}
