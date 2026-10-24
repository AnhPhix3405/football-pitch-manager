import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { UserProfileEntity } from '~/entities/user-profile.entity';

export interface UpsertUserProfileData {
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  skillLevel?: string | null;
  birthday?: string | null;
  gender?: string | null;
}

@Injectable()
export class UserProfileRepository extends BaseRepository<UserProfileEntity> {
  constructor(
    @InjectRepository(UserProfileEntity)
    repository: Repository<UserProfileEntity>,
  ) {
    super(repository);
  }

  findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async upsertByUserId(
    userId: string,
    data: UpsertUserProfileData,
  ): Promise<UserProfileEntity> {
    const existing = await this.repository.findOne({ where: { userId } });

    if (!existing) {
      const created = this.repository.create({
        id: randomUUID(),
        userId,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
        skillLevel: data.skillLevel ?? null,
        birthday: data.birthday ?? null,
        gender: data.gender ?? null,
      });
      await this.repository.save(created);
      return (await this.findByUserId(userId)) ?? created;
    }

    if (data.fullName !== undefined) {
      existing.fullName = data.fullName;
    }
    if (data.avatarUrl !== undefined) {
      existing.avatarUrl = data.avatarUrl;
    }
    if (data.bio !== undefined) {
      existing.bio = data.bio;
    }
    if (data.skillLevel !== undefined) {
      existing.skillLevel = data.skillLevel;
    }
    if (data.birthday !== undefined) {
      existing.birthday = data.birthday;
    }
    if (data.gender !== undefined) {
      existing.gender = data.gender;
    }

    await this.repository.save(existing);
    return (await this.findByUserId(userId)) ?? existing;
  }
}
