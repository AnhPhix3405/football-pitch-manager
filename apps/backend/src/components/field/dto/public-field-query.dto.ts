import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PublicFieldQueryDto {
  @ApiPropertyOptional({
    description: 'Số trang hiện tại (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng phần tử trên mỗi trang (tối đa 100)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tên hoặc địa chỉ cụm sân',
    example: 'Chảo Lửa',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo Quận/Huyện',
    example: 'Tân Bình',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @IsString()
  district?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo yêu cầu đặt cọc (true/false)',
    example: false,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): boolean | undefined => {
    if (value === 'true' || value === true || value === '1' || value === 1) {
      return true;
    }
    if (value === 'false' || value === false || value === '0' || value === 0) {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  requireDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Cột sắp xếp kết quả',
    enum: ['createdAt', 'name'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'name'])
  sortBy?: 'createdAt' | 'name' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp (tăng dần ASC hoặc giảm dần DESC)',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): 'ASC' | 'DESC' | undefined =>
    typeof value === 'string'
      ? (value.toUpperCase() as 'ASC' | 'DESC')
      : (value as 'ASC' | 'DESC' | undefined),
  )
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
