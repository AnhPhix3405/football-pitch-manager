import { Column, Entity, Index } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';

@Entity({ name: 'users' })
@Index(['authProvider', 'providerId'], { unique: true })
@Index(['role'])
@Index(['status'])
export class UserEntity extends UuidEntity {
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'auth_provider', type: 'varchar', default: 'local' })
  authProvider!: string;

  @Column({ name: 'provider_id', type: 'varchar', nullable: true })
  providerId!: string | null;

  @Column({ type: 'varchar', default: 'user' })
  role!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: string | null;
}
