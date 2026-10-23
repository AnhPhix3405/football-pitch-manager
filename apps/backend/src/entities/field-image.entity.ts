import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_images' })
@Index('IDX_field_images_field_id', ['fieldId'])
@Index('IDX_field_images_field_id_display_order', ['fieldId', 'displayOrder'])
@Index('IDX_field_images_field_id_thumbnail', ['fieldId'], {
  unique: true,
  where: '"is_thumbnail" = true',
})
export class FieldImageEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_thumbnail', type: 'boolean', default: false })
  isThumbnail!: boolean;
}
