import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFieldServiceDto {
  @ApiProperty({
    description: 'Tên dịch vụ đi kèm',
    example: 'Thuê bóng thi đấu',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Đơn giá dịch vụ (VNĐ)',
    example: 50000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá dịch vụ phải là số' })
  @Min(0, { message: 'Giá dịch vụ không được âm' })
  price!: number;

  @ApiPropertyOptional({
    description: 'Đơn vị tính (trận, quả, chai, giờ...)',
    example: 'quả / trận',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
