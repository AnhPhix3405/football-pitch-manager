jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { AuthSessionEntity } from '~/entities/auth-session.entity';
import { AuthSessionRepository } from '~/repositories/auth-session.repository';
import {
  AuthSessionService,
  hashRefreshToken,
} from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let repository: jest.Mocked<AuthSessionRepository>;

  const sampleUserId = 'user-uuid-123';
  const sampleSessionId = 'session-uuid-456';
  const rawRefreshToken = 'sample.refresh.token.jwt';
  const newRawRefreshToken = 'new.sample.refresh.token.jwt';

  beforeEach(() => {
    repository = {
      createSession: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
      deleteExpiredSessions: jest.fn(),
    } as unknown as jest.Mocked<AuthSessionRepository>;

    service = new AuthSessionService(repository);
  });

  describe('hashRefreshToken', () => {
    it('produces a deterministic SHA-256 64-char hex string', () => {
      const hash1 = hashRefreshToken('my-token');
      const hash2 = hashRefreshToken('my-token');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('createSession', () => {
    it('hashes the refresh token and creates a session with calculated expiresAt', async () => {
      const mockCreatedSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 604800 * 1000),
      };

      repository.createSession.mockResolvedValue(
        mockCreatedSession as AuthSessionEntity,
      );

      const result = await service.createSession({
        userId: sampleUserId,
        refreshToken: rawRefreshToken,
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        ttlSeconds: 604800,
        sessionId: sampleSessionId,
      });

      expect(repository.createSession).toHaveBeenCalledWith({
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        expiresAt: expect.any(Date),
      });
      expect(result).toEqual(mockCreatedSession);
    });
  });

  describe('validateSession', () => {
    it('returns the session when valid and token hash matches', async () => {
      const mockSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
      };
      repository.findById.mockResolvedValue(mockSession as AuthSessionEntity);

      const result = await service.validateSession(
        sampleSessionId,
        rawRefreshToken,
      );

      expect(repository.findById).toHaveBeenCalledWith(sampleSessionId);
      expect(result).toEqual(mockSession);
    });

    it('throws SESSION_REVOKED (401) if session is not found', async () => {
      repository.findById.mockResolvedValue(null);

      try {
        await service.validateSession(sampleSessionId, rawRefreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'SESSION_REVOKED',
            messageKey: 'error.sessionRevoked',
          }),
        );
      }
    });

    it('throws SESSION_REVOKED (401) if session is revoked', async () => {
      const mockRevokedSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        isRevoked: true,
        expiresAt: new Date(Date.now() + 100000),
      };
      repository.findById.mockResolvedValue(
        mockRevokedSession as AuthSessionEntity,
      );

      try {
        await service.validateSession(sampleSessionId, rawRefreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'SESSION_REVOKED',
            messageKey: 'error.sessionRevoked',
          }),
        );
      }
    });

    it('throws SESSION_EXPIRED (401) if session expiresAt is in the past', async () => {
      const mockExpiredSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        isRevoked: false,
        expiresAt: new Date(Date.now() - 5000),
      };
      repository.findById.mockResolvedValue(
        mockExpiredSession as AuthSessionEntity,
      );

      try {
        await service.validateSession(sampleSessionId, rawRefreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'SESSION_EXPIRED',
            messageKey: 'error.sessionExpired',
          }),
        );
      }
    });

    it('detects token reuse: revokes all user sessions and throws TOKEN_REUSED_COMPROMISED (401)', async () => {
      const mockSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken('valid.current.token'),
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
      };
      repository.findById.mockResolvedValue(mockSession as AuthSessionEntity);

      try {
        // Passing an old / different token
        await service.validateSession(sampleSessionId, 'old.stolen.token');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(repository.revokeAllByUserId).toHaveBeenCalledWith(sampleUserId);
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_REUSED_COMPROMISED',
            messageKey: 'error.tokenReused',
          }),
        );
      }
    });
  });

  describe('rotateSession', () => {
    it('validates current token and updates session with new token hash and new expiry', async () => {
      const mockSession: Partial<AuthSessionEntity> = {
        id: sampleSessionId,
        userId: sampleUserId,
        refreshTokenHash: hashRefreshToken(rawRefreshToken),
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
      };
      repository.findById.mockResolvedValue(mockSession as AuthSessionEntity);
      repository.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.rotateSession(
        sampleSessionId,
        rawRefreshToken,
        newRawRefreshToken,
        604800,
      );

      expect(repository.updateRefreshTokenHash).toHaveBeenCalledWith(
        sampleSessionId,
        hashRefreshToken(newRawRefreshToken),
        expect.any(Date),
      );
      expect(result).toEqual({
        sessionId: sampleSessionId,
        userId: sampleUserId,
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('revokeSession and revokeAllUserSessions', () => {
    it('revokes a single session by id', async () => {
      repository.revokeById.mockResolvedValue(undefined);
      await service.revokeSession(sampleSessionId);
      expect(repository.revokeById).toHaveBeenCalledWith(sampleSessionId);
    });

    it('revokes all sessions for a user', async () => {
      repository.revokeAllByUserId.mockResolvedValue(undefined);
      await service.revokeAllUserSessions(sampleUserId);
      expect(repository.revokeAllByUserId).toHaveBeenCalledWith(sampleUserId);
    });
  });

  describe('cleanExpiredSessions', () => {
    it('calls repository deleteExpiredSessions and returns count of deleted sessions', async () => {
      repository.deleteExpiredSessions.mockResolvedValue(5);
      const count = await service.cleanExpiredSessions();
      expect(repository.deleteExpiredSessions).toHaveBeenCalled();
      expect(count).toBe(5);
    });
  });
});
