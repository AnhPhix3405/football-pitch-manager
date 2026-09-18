import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_rating_summary' })
@Index(['bayesianScore'])
@Index(['avgRating'])
@Check('"total_reviews" >= 0')
export class FieldRatingSummaryEntity {
  @PrimaryColumn({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @OneToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({
    name: 'avg_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  avgRating!: string;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews!: number;

  @Column({
    name: 'bayesian_score',
    type: 'decimal',
    precision: 5,
    scale: 3,
    default: 0,
  })
  bayesianScore!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
