import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '~/entities/transaction.entity';

export class PaymentTransactionResponseDto {
  @ApiProperty({ example: '8f0a0d92-23c2-466d-92a0-4592a407e3d1' })
  id!: string;

  @ApiProperty({ example: '6b6d57a2-19bc-4678-831e-b816a75f0a0e' })
  userId!: string;

  @ApiProperty({ example: 'booking_deposit' })
  type!: string;

  @ApiProperty({ example: '9a9d57a2-19bc-4678-831e-b816a75f0a0e' })
  refId!: string;

  @ApiProperty({ example: '150000.00' })
  amount!: string;

  @ApiProperty({ example: 'pending' })
  status!: string;

  @ApiProperty({ example: 'cash', nullable: true })
  gateway!: string | null;

  @ApiProperty({ example: 'VNP14298129', nullable: true })
  gatewayRef!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(entity: TransactionEntity): PaymentTransactionResponseDto {
    const dto = new PaymentTransactionResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.type = entity.type;
    dto.refId = entity.refId;
    dto.amount = entity.amount;
    dto.status = entity.status;
    dto.gateway = entity.gateway;
    dto.gatewayRef = entity.gatewayRef;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
