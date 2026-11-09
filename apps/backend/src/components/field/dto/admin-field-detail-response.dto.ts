import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdminFieldCourtsSummaryDto,
  AdminFieldOwnerSummaryDto,
  AdminFieldRatingSummaryDto,
} from './admin-field-list-response.dto';

export class AdminFieldCourtItemDto {
  @ApiProperty({ example: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Sân 1 (5 người)' })
  name: string;

  @ApiProperty({ enum: ['5', '7', '11'], example: '5' })
  type: string;

  @ApiProperty({ enum: ['active', 'inactive', 'maintenance'], example: 'active' })
  status: string;

  @ApiPropertyOptional({ example: '2026-10-04T12:00:00.000Z' })
  createdAt?: string;
}

export class AdminFieldImageItemDto {
  @ApiProperty({ example: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'https://storage.example.com/pitch1.jpg' })
  url: string;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  @ApiProperty({ example: true })
  isThumbnail: boolean;
}

export class AdminFieldServiceItemDto {
  @ApiProperty({ example: 's1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Nước lọc / Trà đá' })
  name: string;

  @ApiProperty({ example: 30000 })
  price: number;

  @ApiPropertyOptional({ example: 'thùng', nullable: true })
  unit: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class AdminFieldDetailResponseDto {
  @ApiProperty({ example: 'd3b07384-d113-40e1-95b6-75399589d6e4' })
  id: string;

  @ApiProperty({ example: 'Sân bóng Tân Bình Sport Complex' })
  name: string;

  @ApiProperty({ example: '120 Hoàng Hoa Thám, Phường 12' })
  address: string;

  @ApiPropertyOptional({ example: 'Tân Bình', nullable: true })
  district: string | null;

  @ApiPropertyOptional({ example: 10.798123, nullable: true })
  lat: number | null;

  @ApiPropertyOptional({ example: 106.654321, nullable: true })
  lng: number | null;

  @ApiPropertyOptional({ example: 'Cụm sân cỏ nhân tạo đạt chuẩn FIFA 2 sao...', nullable: true })
  description: string | null;

  @ApiProperty({ enum: ['active', 'inactive', 'pending', 'rejected'], example: 'active' })
  status: 'active' | 'inactive' | 'pending' | 'rejected';

  @ApiProperty({ example: true })
  requireDeposit: boolean;

  @ApiPropertyOptional({ example: 'fixed', nullable: true })
  depositType: string | null;

  @ApiPropertyOptional({ example: 100000, nullable: true })
  depositValue: number | null;

  @ApiProperty({ example: '100.000 ₫ (Cố định)' })
  depositFormatted: string;

  @ApiProperty({ type: () => AdminFieldOwnerSummaryDto })
  owner: AdminFieldOwnerSummaryDto;

  @ApiProperty({ type: () => AdminFieldCourtsSummaryDto })
  courtsSummary: AdminFieldCourtsSummaryDto;

  @ApiProperty({ type: () => [AdminFieldCourtItemDto] })
  courts: AdminFieldCourtItemDto[];

  @ApiProperty({ type: () => [AdminFieldImageItemDto] })
  images: AdminFieldImageItemDto[];

  @ApiProperty({ type: () => [AdminFieldServiceItemDto] })
  services: AdminFieldServiceItemDto[];

  @ApiProperty({ type: () => AdminFieldRatingSummaryDto })
  ratingSummary: AdminFieldRatingSummaryDto;

  @ApiPropertyOptional({ example: '2026-10-04T12:00:00.000Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: '2026-10-04T12:00:00.000Z' })
  updatedAt: string;
}
