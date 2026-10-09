import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { AuthSessionEntity } from '~/entities/auth-session.entity';

export interface CreateAuthSessionData {
  id?: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

@Injectable()
export class AuthSessionRepository extends BaseRepository<AuthSessionEntity> {
  constructor(
    @InjectRepository(AuthSessionEntity)
    repository: Repository<AuthSessionEntity>,
  ) {
    super(repository);
  }

  async createSession(data: CreateAuthSessionData): Promise<AuthSessionEntity> {
    const session = this.repository.create({
      id: data.id ?? randomUUID(),
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      isRevoked: false,
      expiresAt: data.expiresAt,
    });
    return this.repository.save(session);
  }

  findByUserId(userId: string): Promise<AuthSessionEntity[]> {
    return this.repository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(
      { id },
      {
        refreshTokenHash,
        expiresAt,
      },
    );
  }

  async revokeById(id: string): Promise<void> {
    await this.repository.update({ id }, { isRevoked: true });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repository.update({ userId }, { isRevoked: true });
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}
