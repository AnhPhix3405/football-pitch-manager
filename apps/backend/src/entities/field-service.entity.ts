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

@Entity({ name: 'field_services' })
@Index('IDX_field_services_field_id', ['fieldId'])
@Index('IDX_field_services_field_id_is_active', ['fieldId', 'isActive'])
@Check('CHK_field_services_price', '"price" >= 0')
@Unique('UQ_field_services_field_id_name', ['fieldId', 'name'])
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
