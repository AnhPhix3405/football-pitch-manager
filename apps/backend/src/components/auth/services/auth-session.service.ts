import { createHash } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { AuthSessionEntity } from '~/entities/auth-session.entity';
import { AuthSessionRepository } from '~/repositories/auth-session.repository';

export interface CreateSessionOptions {
  userId: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  ttlSeconds: number;
  sessionId?: string;
}

export interface RotateSessionResult {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export const hashRefreshToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
  ) {}

  async createSession(options: CreateSessionOptions): Promise<AuthSessionEntity> {
    const refreshTokenHash = hashRefreshToken(options.refreshToken);
    const expiresAt = new Date(Date.now() + options.ttlSeconds * 1000);

    return this.authSessionRepository.createSession({
      id: options.sessionId,
      userId: options.userId,
      refreshTokenHash,
      userAgent: options.userAgent ?? null,
      ipAddress: options.ipAddress ?? null,
      expiresAt,
    });
  }

  async validateSession(
    sessionId: string,
    refreshToken: string,
  ): Promise<AuthSessionEntity> {
    const session = await this.authSessionRepository.findById(sessionId);

    if (!session || session.isRevoked) {
      throw new ApplicationException({
        code: 'SESSION_REVOKED',
        messageKey: 'error.sessionRevoked',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new ApplicationException({
        code: 'SESSION_EXPIRED',
        messageKey: 'error.sessionExpired',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const providedHash = hashRefreshToken(refreshToken);
    if (providedHash !== session.refreshTokenHash) {
      // Token reuse detected! Potential token theft / replay attack.
      // Revoke all sessions for this user to protect the account.
      await this.authSessionRepository.revokeAllByUserId(session.userId);
      throw new ApplicationException({
        code: 'TOKEN_REUSED_COMPROMISED',
        messageKey: 'error.tokenReused',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return session;
  }

  async rotateSession(
    sessionId: string,
    currentRefreshToken: string,
    newRefreshToken: string,
    newTtlSeconds: number,
  ): Promise<RotateSessionResult> {
    const session = await this.validateSession(sessionId, currentRefreshToken);

    const newHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + newTtlSeconds * 1000);

    await this.authSessionRepository.updateRefreshTokenHash(
      sessionId,
      newHash,
      newExpiresAt,
    );

    return {
      sessionId,
      userId: session.userId,
      expiresAt: newExpiresAt,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.authSessionRepository.revokeById(sessionId);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.authSessionRepository.revokeAllByUserId(userId);
  }

  async cleanExpiredSessions(): Promise<number> {
    return this.authSessionRepository.deleteExpiredSessions();
  }
}
