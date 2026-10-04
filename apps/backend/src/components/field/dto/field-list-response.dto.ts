import { ApiProperty } from '@nestjs/swagger';
import { FieldResponseDto } from './field-response.dto';

export class FieldListResponseDto {
  @ApiProperty({
    description: 'Danh sách các cụm sân bóng',
    type: [FieldResponseDto],
  })
  items!: FieldResponseDto[];

  @ApiProperty({
    description: 'Tổng số lượng bản ghi thoả mãn bộ lọc',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Số lượng bản ghi trên một trang',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 3,
  })
  totalPages!: number;
}
