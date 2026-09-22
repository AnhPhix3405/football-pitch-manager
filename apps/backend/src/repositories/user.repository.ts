import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';

export type DuplicateRegistrationField = 'email' | 'phone';

export class DuplicateRegistrationFieldError extends Error {
  constructor(readonly field: DuplicateRegistrationField) {
    super(`Duplicate registration field: ${field}`);
  }
}

export interface CreateLocalAccountData {
  email: string;
  phone: string | null;
  passwordHash: string;
  fullName: string | null;
}

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) repository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ email });
  }

  findByEmailWithPasswordHash(email: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByPhone(phone: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ phone });
  }

  async createLocalAccount(
    data: CreateLocalAccountData,
  ): Promise<{ user: UserEntity; profile: UserProfileEntity }> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(UserEntity);
        const profileRepository = manager.getRepository(UserProfileEntity);
        const user = await userRepository.save(
          userRepository.create({
            id: randomUUID(),
            email: data.email,
            phone: data.phone,
            passwordHash: data.passwordHash,
            authProvider: 'local',
            providerId: null,
            role: 'user',
            status: 'active',
            lat: null,
            lng: null,
          }),
        );
        const profile = await profileRepository.save(
          profileRepository.create({
            id: randomUUID(),
            userId: user.id,
            fullName: data.fullName,
            avatarUrl: null,
            bio: null,
            skillLevel: null,
            birthday: null,
            gender: null,
          }),
        );

        return { user, profile };
      });
    } catch (error: unknown) {
      const duplicateField = this.getDuplicateField(error);
      if (duplicateField) {
        throw new DuplicateRegistrationFieldError(duplicateField);
      }

      throw error;
    }
  }

  private getDuplicateField(error: unknown): DuplicateRegistrationField | null {
    if (!(error instanceof QueryFailedError)) {
      return null;
    }

    const driverError = error.driverError as {
      code?: unknown;
      constraint?: unknown;
      detail?: unknown;
    };
    if (driverError.code !== '23505') {
      return null;
    }

    const constraint =
      typeof driverError.constraint === 'string' ? driverError.constraint : '';
    const detail =
      typeof driverError.detail === 'string' ? driverError.detail : '';
    const databaseMessage = `${constraint} ${detail}`.toLowerCase();

    if (databaseMessage.includes('email')) {
      return 'email';
    }
    if (databaseMessage.includes('phone')) {
      return 'phone';
    }

    return null;
  }
}
