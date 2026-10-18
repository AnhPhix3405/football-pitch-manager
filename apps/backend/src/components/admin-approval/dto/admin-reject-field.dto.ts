import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminRejectFieldDto {
  @ApiProperty({
    description: 'Lý do từ chối phê duyệt cụm sân',
    example:
      'Địa chỉ sân không chính xác hoặc thiếu giấy phép kinh doanh hợp lệ.',
    maxLength: 500,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  @IsNotEmpty({ message: 'rejectionReasonRequired' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
