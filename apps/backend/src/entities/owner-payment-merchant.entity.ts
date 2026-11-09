import { Column, Entity, Index } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';

@Entity('owner_payment_merchants')
@Index(['ownerId', 'createdAt'])
export class OwnerPaymentMerchantEntity extends UuidEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ name: 'terminal_code', type: 'varchar', length: 32 })
  terminalCode!: string;

  @Column({ name: 'encrypted_secret', type: 'text', select: false })
  encryptedSecret!: string;
}
