import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateFieldServiceDto {
  @ApiPropertyOptional({
    description: 'Tên dịch vụ đi kèm',
    example: 'Thuê bóng thi đấu loại 1',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Đơn giá dịch vụ (VNĐ)',
    example: 60000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá dịch vụ phải là số' })
  @Min(0, { message: 'Giá dịch vụ không được âm' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Đơn vị tính',
    example: 'quả / trận',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
