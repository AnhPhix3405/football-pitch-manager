import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết tìm đối',
    example: 'Tìm kèo giao hữu 7v7 tối thứ 6 sân Chánh Hưng',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Nội dung chi tiết, tiền sân chia 5-5, màu áo, quy định',
    example:
      'Đội mình trung bình, đá văn minh không va chạm thô bạo. Tiền sân chia đều.',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Ngày đá bóng (YYYY-MM-DD)',
    example: '2026-10-25',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ngày đá không được để trống' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày đá phải đúng định dạng YYYY-MM-DD',
  })
  playDate!: string;

  @ApiProperty({
    description: 'Giờ bắt đầu (HH:mm)',
    example: '19:00',
  })
  @IsString()
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  startTime!: string;

  @ApiPropertyOptional({
    description: 'Giờ kết thúc (HH:mm)',
    example: '20:30',
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Trình độ yêu cầu',
    example: 'Trung bình',
  })
  @IsString()
  @IsOptional()
  skillLevelRequired?: string;

  @ApiPropertyOptional({
    description:
      'Số người đá mỗi đội hoặc quy mô trận đấu (ví dụ: 10, 14, 5, 7)',
    example: 14,
    default: 14,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Số người tối thiểu là 1' })
  @Max(30, { message: 'Số người tối đa là 30' })
  maxPlayers?: number;

  @ApiPropertyOptional({
    description: 'Vĩ độ vị trí sân',
    example: '10.762622',
  })
  @IsOptional()
  lat?: string | number;

  @ApiPropertyOptional({
    description: 'Kinh độ vị trí sân',
    example: '106.660172',
  })
  @IsOptional()
  lng?: string | number;
}
