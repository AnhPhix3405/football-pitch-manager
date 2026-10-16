import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryPostDto {
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
    description: 'Số lượng bài mỗi trang (mặc định: 10)',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tiêu đề, mô tả)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Trình độ yêu cầu (Phong trào, Trung bình khá, Khá)',
  })
  @IsString()
  @IsOptional()
  skillLevel?: string;

  @ApiPropertyOptional({ description: 'Ngày đá (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  playDate?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái bài đăng (open, matched, closed)',
  })
  @IsString()
  @IsOptional()
  status?: string;
}
