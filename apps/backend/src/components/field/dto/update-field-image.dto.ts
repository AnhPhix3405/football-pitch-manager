import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateFieldImageDto {
  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Đặt làm ảnh đại diện',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;
}
