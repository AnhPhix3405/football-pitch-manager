import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldServiceResponseDto {
  @ApiProperty({
    description: 'UUID của dịch vụ',
    example: 's1d2e3f4-a5b6-7890-1234-56789abcdef0',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID của cụm sân cha',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  fieldId!: string;

  @ApiProperty({
    description: 'Tên dịch vụ đi kèm',
    example: 'Thuê bóng thi đấu',
  })
  name!: string;

  @ApiProperty({
    description: 'Đơn giá dịch vụ',
    example: 50000,
  })
  price!: number;

  @ApiPropertyOptional({
    description: 'Đơn vị tính',
    example: 'quả / trận',
    nullable: true,
  })
  unit!: string | null;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Thời điểm tạo',
    example: '2026-10-23T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật gần nhất',
    example: '2026-10-23T08:00:00.000Z',
  })
  updatedAt!: Date;
}
