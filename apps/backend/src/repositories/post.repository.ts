import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { PostEntity } from '~/entities/post.entity';

export interface FindPublicPostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  skillLevel?: string;
  playDate?: string;
}

export interface FindMyPostsOptions {
  page?: number;
  limit?: number;
  status?: string;
}

@Injectable()
export class PostRepository extends BaseRepository<PostEntity> {
  constructor(
    @InjectRepository(PostEntity) repository: Repository<PostEntity>,
  ) {
    super(repository);
  }

  async findPublicPosts(options: FindPublicPostsOptions = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const today = dayjs().format('YYYY-MM-DD');
    const nowTime = dayjs().format('HH:mm:ss');

    const qb = this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.deletedAt IS NULL')
      .andWhere('post.status = :status', { status: 'open' })
      .andWhere(
        '(post.playDate > :today OR (post.playDate = :today AND COALESCE(post.endTime, post.startTime) > :nowTime))',
        { today, nowTime },
      );

    if (options.search?.trim()) {
      const search = `%${options.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.content) LIKE :search)',
        { search },
      );
    }

    if (options.skillLevel?.trim() && options.skillLevel !== 'all') {
      qb.andWhere('post.skillLevelRequired = :skillLevel', {
        skillLevel: options.skillLevel.trim(),
      });
    }

    if (options.playDate?.trim()) {
      qb.andWhere('post.playDate = :playDate', {
        playDate: options.playDate.trim(),
      });
    }

    qb.orderBy('post.playDate', 'ASC')
      .addOrderBy('post.startTime', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findMyPosts(userId: string, options: FindMyPostsOptions = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .andWhere('post.deletedAt IS NULL');

    if (options.status?.trim()) {
      qb.andWhere('post.status = :status', { status: options.status.trim() });
    }

    qb.orderBy('post.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findPostDetailById(id: string): Promise<PostEntity | null> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id })
      .andWhere('post.deletedAt IS NULL')
      .getOne();
  }

  async closeExpiredPostsToday(
    today: string,
    currentTime: string,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PostEntity)
      .set({
        status: 'closed',
      })
      .where('"deleted_at" IS NULL')
      .andWhere('"status" = :openStatus', { openStatus: 'open' })
      .andWhere('"play_date" = :today', { today })
      .andWhere('COALESCE("end_time", "start_time") <= :currentTime', {
        currentTime,
      })
      .execute();

    return result.affected ?? 0;
  }

  async softDeleteExpiredPosts(currentDate: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PostEntity)
      .set({
        deletedAt: new Date(),
        status: 'closed',
      })
      .where('"deleted_at" IS NULL')
      .andWhere('"play_date" < :currentDate', { currentDate })
      .execute();

    return result.affected ?? 0;
  }

  async hardDeleteExpiredPosts(cutoffDate: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(PostEntity)
      .where('"deleted_at" IS NOT NULL')
      .andWhere('"deleted_at" <= :cutoffDate', { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }
}
