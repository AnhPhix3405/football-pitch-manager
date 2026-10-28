import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Họ và tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh đại diện (URL)',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Tiểu sử / Giới thiệu bản thân',
    example: 'Đam mê bóng đá, thích đá vị trí tiền vệ',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Trình độ chơi bóng (Dễ, Trung bình, Khá, Bán chuyên...)',
    example: 'Trung bình',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skillLevel?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh (YYYY-MM-DD)',
    example: '1995-10-20',
  })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Giới tính',
    example: 'male',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0901234567',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Vĩ độ vị trí người dùng',
    example: 10.762622,
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Kinh độ vị trí người dùng',
    example: 106.660172,
  })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
