import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminFieldApprovalQueryDto {
  @ApiPropertyOptional({
    description:
      'Từ khóa tìm kiếm theo tên sân bóng, địa chỉ, quận/huyện hoặc email người gửi',
    example: 'Tân Bình',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Lọc từ ngày gửi yêu cầu (định dạng YYYY-MM-DD hoặc ISO 8601 string)',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description:
      'Lọc đến ngày gửi yêu cầu (định dạng YYYY-MM-DD hoặc ISO 8601 string)',
    example: '2026-10-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái yêu cầu duyệt để lọc',
    enum: ['pending', 'approved', 'rejected', 'all'],
    default: 'pending',
    example: 'pending',
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'all'])
  status?: string = 'pending';

  @ApiPropertyOptional({
    description:
      'Loại yêu cầu duyệt để lọc: field_create, field_update, hoặc all',
    enum: ['field_create', 'field_update', 'all'],
    default: 'all',
    example: 'all',
  })
  @IsOptional()
  @IsIn(['field_create', 'field_update', 'all'])
  type?: 'field_create' | 'field_update' | 'all' = 'all';

  @ApiPropertyOptional({
    description: 'Số trang (1-indexed)',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên một trang',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
