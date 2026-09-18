import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_courts' })
@Index(['fieldId'])
@Index(['fieldId', 'status'])
export class FieldCourtEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;
}
