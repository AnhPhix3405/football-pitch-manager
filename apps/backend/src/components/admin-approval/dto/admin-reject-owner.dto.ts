import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminRejectOwnerDto {
  @ApiProperty({
    description: 'Lý do từ chối yêu cầu đăng ký chủ sân',
    example: 'Giấy phép kinh doanh không khớp thông tin đăng ký hoặc đã hết hạn.',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason!: string;
}
