import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_images' })
@Index(['fieldId'])
@Index(['fieldId'], { unique: true, where: '"is_thumbnail" = true' })
export class FieldImageEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ name: 'is_thumbnail', type: 'boolean', default: false })
  isThumbnail!: boolean;
}
