import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancellationPreviewResponseDto {
  @ApiProperty({
    description: 'UUID của đơn đặt sân',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  bookingId!: string;

  @ApiProperty({
    description:
      'Số giờ còn lại trước khi trận đấu bắt đầu (có thể âm nếu trận đã qua)',
    example: 26.5,
  })
  hoursUntilMatch!: number;

  @ApiProperty({
    description: 'Đơn đặt sân có đủ điều kiện để hủy hay không',
    example: true,
  })
  canCancel!: boolean;

  @ApiProperty({
    description: 'Tỷ lệ phạt cọc áp dụng (0%, 50% hoặc 100%)',
    example: 0,
  })
  penaltyPercentage!: number;

  @ApiProperty({
    description: 'Số tiền đặt cọc của đơn (VNĐ)',
    example: 300000,
  })
  depositAmount!: number;

  @ApiProperty({
    description: 'Số tiền phạt dự kiến bị khấu trừ (VNĐ)',
    example: 0,
  })
  penaltyAmount!: number;

  @ApiProperty({
    description: 'Số tiền đặt cọc dự kiến được hoàn trả (VNĐ)',
    example: 300000,
  })
  refundAmount!: number;

  @ApiProperty({
    description: 'Nội dung điều khoản chính sách hủy sân áp dụng',
    example: 'Hủy trước 24 giờ: Miễn phí hủy, hoàn 100% tiền đặt cọc.',
  })
  policyDescription!: string;

  @ApiPropertyOptional({
    description: 'Lý do chặn hủy nếu không thể hủy',
    example: 'Trận đấu đã bắt đầu hoặc kết thúc, không thể hủy lịch đặt.',
  })
  blockReason?: string;
}
