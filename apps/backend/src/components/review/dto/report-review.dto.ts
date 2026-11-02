import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportReviewDto {
  @ApiProperty({
    description: 'Lý do báo cáo vi phạm đánh giá (tối đa 255 ký tự)',
    example: 'Nội dung chứa từ ngữ xúc phạm hoặc thông tin sai sự thật',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Lý do báo cáo không được để trống' })
  @MaxLength(255, { message: 'Lý do báo cáo tối đa 255 ký tự' })
  reason!: string;
}
