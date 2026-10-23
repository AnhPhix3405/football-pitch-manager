import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_courts' })
@Index('IDX_field_courts_field_id', ['fieldId'])
@Index('IDX_field_courts_field_id_status', ['fieldId', 'status'])
@Index('IDX_field_courts_field_id_type_status', ['fieldId', 'type', 'status'])
@Check('CHK_field_courts_type', "\"type\" IN ('5', '7', '11')")
@Check(
  'CHK_field_courts_status',
  "\"status\" IN ('active', 'inactive', 'maintenance')",
)
@Unique('UQ_field_courts_field_id_name', ['fieldId', 'name'])
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
