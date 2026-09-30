import { Injectable } from '@nestjs/common';
import { AuthSessionService } from './auth-session.service';
import { TokenService } from './token.service';

@Injectable()
export class LogoutService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(refreshToken?: string | null): Promise<{ success: true }> {
    if (refreshToken && typeof refreshToken === 'string' && refreshToken.trim().length > 0) {
      try {
        const payload = await this.tokenService.verifyRefreshToken(
          refreshToken.trim(),
        );
        if (payload?.sessionId) {
          await this.authSessionService.revokeSession(payload.sessionId);
        }
      } catch {
        // Silently ignore verification or session errors during logout to ensure idempotency
      }
    }

    return { success: true };
  }

  async logoutAll(userId: string): Promise<{ success: true }> {
    await this.authSessionService.revokeAllUserSessions(userId);
    return { success: true };
  }
}
