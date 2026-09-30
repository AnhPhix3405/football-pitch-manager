import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { AccountStatusGuard } from './account-status.guard';

describe('AccountStatusGuard', () => {
  let guard: AccountStatusGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new AccountStatusGuard(reflector);
  });

  const createMockContext = (user?: { status?: string }): ExecutionContext => {
    const request = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('allows access on @Public() routes', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    const context = createMockContext({ status: 'banned' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user status is active', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ status: 'active' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ACCOUNT_BANNED (403) when user status is banned', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ status: 'banned' });

    try {
      guard.canActivate(context);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'ACCOUNT_BANNED',
          messageKey: 'error.accountBanned',
        }),
      );
    }
  });

  it('throws ACCOUNT_STATUS_INVALID (403) when user status is not in @AllowedStatuses', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'allowedAccountStatuses') return ['active'];
      return undefined;
    });
    const context = createMockContext({ status: 'unverified' });

    try {
      guard.canActivate(context);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'ACCOUNT_STATUS_INVALID',
          messageKey: 'error.accountStatusInvalid',
        }),
      );
    }
  });
});
