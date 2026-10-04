import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldResponseDto {
  @ApiProperty({
    description: 'UUID của cụm sân',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID của chủ sân sở hữu',
    example: 'b7c12345-d113-40e1-95b6-75399589d6e4',
  })
  ownerId!: string;

  @ApiProperty({
    description: 'Tên cụm sân',
    example: 'Sân bóng Tân Bình Sport Complex',
  })
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ cụm sân',
    example: '120 Hoàng Hoa Thám, Phường 12',
  })
  address!: string;

  @ApiPropertyOptional({
    description: 'Quận/Huyện',
    example: 'Tân Bình',
    nullable: true,
  })
  district!: string | null;

  @ApiPropertyOptional({
    description: 'Vĩ độ toạ độ (Latitude)',
    example: 10.798123,
    nullable: true,
  })
  lat!: number | null;

  @ApiPropertyOptional({
    description: 'Kinh độ toạ độ (Longitude)',
    example: 106.654321,
    nullable: true,
  })
  lng!: number | null;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết',
    example: 'Cụm sân cỏ nhân tạo cao cấp...',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Trạng thái cụm sân: pending, active, inactive, rejected',
    enum: ['pending', 'active', 'inactive', 'rejected'],
    example: 'pending',
  })
  status!: string;

  @ApiProperty({
    description: 'Có yêu cầu đặt cọc hay không',
    example: true,
  })
  requireDeposit!: boolean;

  @ApiPropertyOptional({
    description: 'Loại đặt cọc: fixed hoặc percentage',
    enum: ['fixed', 'percentage'],
    example: 'fixed',
    nullable: true,
  })
  depositType!: string | null;

  @ApiPropertyOptional({
    description: 'Giá trị tiền cọc (VND hoặc %)',
    example: 100000,
    nullable: true,
  })
  depositValue!: number | null;

  @ApiProperty({
    description: 'Thời điểm tạo bản ghi',
    example: '2026-10-04T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật bản ghi gần nhất',
    example: '2026-10-04T12:00:00.000Z',
  })
  updatedAt!: Date;
}
