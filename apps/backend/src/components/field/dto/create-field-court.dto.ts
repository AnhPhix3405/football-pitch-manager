import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFieldCourtDto {
  @ApiProperty({
    description: 'Tên sân con',
    example: 'Sân 1 (5 người)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên sân con không được để trống' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Loại sân vật lý (5, 7, hoặc 11 người)',
    example: '5',
    enum: ['5', '7', '11'],
  })
  @IsString()
  @IsIn(['5', '7', '11'], { message: 'Loại sân phải là 5, 7 hoặc 11' })
  type!: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động',
    example: 'active',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'maintenance'], {
    message: 'Trạng thái phải là active, inactive hoặc maintenance',
  })
  status?: string;
}
