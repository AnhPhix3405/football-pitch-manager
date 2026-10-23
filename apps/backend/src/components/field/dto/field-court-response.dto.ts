import { ApiProperty } from '@nestjs/swagger';

export class FieldCourtResponseDto {
  @ApiProperty({
    description: 'UUID của sân con',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID của cụm sân cha',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  fieldId!: string;

  @ApiProperty({
    description: 'Tên sân con',
    example: 'Sân 1',
  })
  name!: string;

  @ApiProperty({
    description: 'Loại sân (5, 7, 11)',
    example: '5',
  })
  type!: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: 'active',
  })
  status!: string;

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
