import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  MODERATION_ACTION,
  type ModerationAction,
} from '../constants/review.constant';

export class ModerateReviewDto {
  @ApiProperty({
    description:
      'Hành động kiểm duyệt: dismiss (bỏ qua báo cáo), hide (ẩn đánh giá)',
    enum: [MODERATION_ACTION.DISMISS, MODERATION_ACTION.HIDE],
    example: MODERATION_ACTION.HIDE,
  })
  @IsNotEmpty({ message: 'action không được để trống' })
  @IsIn([MODERATION_ACTION.DISMISS, MODERATION_ACTION.HIDE], {
    message: 'action phải là dismiss hoặc hide',
  })
  action!: ModerationAction;

  @ApiPropertyOptional({
    description: 'Ghi chú kiểm duyệt của quản trị viên (tối đa 255 ký tự)',
    example: 'Đánh giá vi phạm tiêu chuẩn cộng đồng, đã ẩn',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'reason tối đa 255 ký tự' })
  reason?: string;
}
