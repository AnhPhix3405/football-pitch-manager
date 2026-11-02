import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';

@Injectable()
export class UserRatingSummaryRepository {
  constructor(
    @InjectRepository(UserRatingSummaryEntity)
    private readonly repository: Repository<UserRatingSummaryEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserRatingSummaryEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async save(
    summary: UserRatingSummaryEntity,
  ): Promise<UserRatingSummaryEntity> {
    return this.repository.save(summary);
  }

  create(data: Partial<UserRatingSummaryEntity>): UserRatingSummaryEntity {
    return this.repository.create(data);
  }
}
