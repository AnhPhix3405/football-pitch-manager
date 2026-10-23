import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateFieldImageDto {
  @ApiProperty({
    description: 'URL của hình ảnh',
    example: 'https://storage.example.com/fields/pitch-1.jpg',
  })
  @IsUrl({}, { message: 'URL hình ảnh không hợp lệ' })
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
  url!: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Đặt làm ảnh đại diện',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;
}
