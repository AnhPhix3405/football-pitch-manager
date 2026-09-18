import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_services' })
@Index(['fieldId'])
@Index(['fieldId', 'isActive'])
@Check('"price" >= 0')
export class FieldServiceEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: string;

  @Column({ type: 'varchar', nullable: true })
  unit!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
