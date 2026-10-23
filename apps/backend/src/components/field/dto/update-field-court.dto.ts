import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFieldCourtDto {
  @ApiPropertyOptional({
    description: 'Tên sân con',
    example: 'Sân 1 VIP',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Loại sân vật lý (5, 7, hoặc 11 người)',
    example: '7',
    enum: ['5', '7', '11'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['5', '7', '11'], { message: 'Loại sân phải là 5, 7 hoặc 11' })
  type?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động',
    example: 'maintenance',
    enum: ['active', 'inactive', 'maintenance'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'maintenance'], {
    message: 'Trạng thái phải là active, inactive hoặc maintenance',
  })
  status?: string;
}
