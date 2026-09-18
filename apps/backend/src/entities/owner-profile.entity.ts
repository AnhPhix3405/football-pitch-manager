import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'owner_profiles' })
export class OwnerProfileEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  businessName!: string | null;

  @Column({ name: 'business_license', type: 'varchar', nullable: true })
  businessLicense!: string | null;

  @Column({ name: 'bank_account', type: 'varchar', nullable: true })
  bankAccount!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
