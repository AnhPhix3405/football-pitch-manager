jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { AuthSessionService } from './auth-session.service';
import { LogoutService } from './logout.service';
import { TokenService } from './token.service';

describe('LogoutService', () => {
  let service: LogoutService;
  let tokenService: jest.Mocked<TokenService>;
  let authSessionService: jest.Mocked<AuthSessionService>;

  const sampleSessionId = 'session-uuid-456';
  const rawRefreshToken = 'valid.refresh.token.jwt';

  beforeEach(() => {
    tokenService = {
      verifyRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    authSessionService = {
      revokeSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    } as unknown as jest.Mocked<AuthSessionService>;

    service = new LogoutService(tokenService, authSessionService);
  });

  it('revokes session by sessionId when valid refreshToken is supplied', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      sessionId: sampleSessionId,
      type: 'refresh',
    });
    authSessionService.revokeSession.mockResolvedValue(undefined);

    const result = await service.execute(rawRefreshToken);

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(rawRefreshToken);
    expect(authSessionService.revokeSession).toHaveBeenCalledWith(
      sampleSessionId,
    );
    expect(result).toEqual({ success: true });
  });

  it('is idempotent: ignores invalid or expired token without throwing errors', async () => {
    tokenService.verifyRefreshToken.mockRejectedValue(new Error('Token expired'));

    const result = await service.execute('expired.invalid.token');

    expect(authSessionService.revokeSession).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('is idempotent: returns success if refreshToken is null or empty', async () => {
    const result = await service.execute(null);

    expect(tokenService.verifyRefreshToken).not.toHaveBeenCalled();
    expect(authSessionService.revokeSession).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('revokes all user sessions in logoutAll', async () => {
    authSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

    const result = await service.logoutAll('user-uuid-123');

    expect(authSessionService.revokeAllUserSessions).toHaveBeenCalledWith(
      'user-uuid-123',
    );
    expect(result).toEqual({ success: true });
  });
});
