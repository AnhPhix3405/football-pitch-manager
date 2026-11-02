import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SubscribePlanDto {
  @ApiProperty({
    description: 'ID của gói thành viên muốn đăng ký (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'planId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'planId không được để trống' })
  planId!: string;
}
