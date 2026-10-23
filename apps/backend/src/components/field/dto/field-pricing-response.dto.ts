import { ApiProperty } from '@nestjs/swagger';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';

export class FieldPricingResponseDto {
  @ApiProperty({ example: '843f0d8e-72f5-4a4d-9a3f-b5eb4923cbad' })
  id!: string;

  @ApiProperty({ example: 'd038f706-a55b-46af-aff2-feccb9f739ba' })
  fieldId!: string;

  @ApiProperty({ example: '5' })
  courtType!: string;

  @ApiProperty({ example: 'weekday' })
  dayType!: string;

  @ApiProperty({ example: '06:00' })
  startTime!: string;

  @ApiProperty({ example: '17:00' })
  endTime!: string;

  @ApiProperty({ example: 200000 })
  price!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static fromEntity(entity: FieldPricingEntity): FieldPricingResponseDto {
    return {
      id: entity.id,
      fieldId: entity.fieldId,
      courtType: entity.courtType,
      dayType: entity.dayType,
      startTime: entity.startTime ? entity.startTime.slice(0, 5) : '',
      endTime: entity.endTime ? entity.endTime.slice(0, 5) : '',
      price: Number(entity.price),
      createdAt:
        entity.createdAt instanceof Date
          ? entity.createdAt.toISOString()
          : String(entity.createdAt),
      updatedAt:
        entity.updatedAt instanceof Date
          ? entity.updatedAt.toISOString()
          : String(entity.updatedAt),
    };
  }
}
