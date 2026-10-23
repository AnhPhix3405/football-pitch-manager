import { ApiProperty } from '@nestjs/swagger';

export class FieldImageResponseDto {
  @ApiProperty({
    description: 'UUID của hình ảnh',
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID của cụm sân cha',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  fieldId!: string;

  @ApiProperty({
    description: 'Đường dẫn URL hình ảnh',
    example: 'https://storage.example.com/fields/pitch-1.jpg',
  })
  url!: string;

  @ApiProperty({
    description: 'Thứ tự hiển thị',
    example: 0,
  })
  displayOrder!: number;

  @ApiProperty({
    description: 'Có phải ảnh đại diện (thumbnail) không',
    example: true,
  })
  isThumbnail!: boolean;

  @ApiProperty({
    description: 'Thời điểm tải lên',
    example: '2026-10-23T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật gần nhất',
    example: '2026-10-23T08:00:00.000Z',
  })
  updatedAt!: Date;
}
