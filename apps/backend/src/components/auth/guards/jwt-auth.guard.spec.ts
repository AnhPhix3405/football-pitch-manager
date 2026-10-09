import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    tokenService = {
      verifyAccessToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    guard = new JwtAuthGuard(reflector, tokenService);
  });

  const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const request = {
      headers,
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('bypasses authentication when @Public() is present', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('throws UNAUTHORIZED_ACCESS (401) when Authorization header is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({});

    try {
      await guard.canActivate(context);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'UNAUTHORIZED_ACCESS',
          messageKey: 'error.unauthorizedAccess',
        }),
      );
    }
  });

  it('throws UNAUTHORIZED_ACCESS (401) when scheme is not Bearer', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      authorization: 'Basic dXNlcjpwYXNz',
    });

    try {
      await guard.canActivate(context);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('verifies token and sets req.user when valid Bearer token is provided', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      authorization: 'Bearer valid.jwt.token',
    });
    const mockPayload = {
      sub: 'user-uuid-123',
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      type: 'access' as const,
    };
    tokenService.verifyAccessToken.mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('valid.jwt.token');
    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual(mockPayload);
  });
});
