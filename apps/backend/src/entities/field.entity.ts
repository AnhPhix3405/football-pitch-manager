import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'fields' })
@Index(['ownerId'])
@Index(['status'])
@Index(['district'])
@Index(['lat', 'lng'])
@Check('"deposit_value" IS NULL OR "deposit_value" >= 0')
export class FieldEntity extends UuidEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'varchar', nullable: true })
  district!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ name: 'require_deposit', type: 'boolean', default: false })
  requireDeposit!: boolean;

  @Column({ name: 'deposit_type', type: 'varchar', nullable: true })
  depositType!: string | null;

  @Column({
    name: 'deposit_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  depositValue!: string | null;
}
