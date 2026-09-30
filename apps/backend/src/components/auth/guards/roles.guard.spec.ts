import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: { role?: string }): ExecutionContext => {
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

    const context = createMockContext({ role: 'user' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when route has no @Roles requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ role: 'user' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user role matches required roles', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'roles') return ['admin', 'owner'];
      return undefined;
    });
    const context = createMockContext({ role: 'admin' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws FORBIDDEN_ROLE (403) when user role does not match required roles', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'roles') return ['admin', 'owner'];
      return undefined;
    });
    const context = createMockContext({ role: 'user' });

    try {
      guard.canActivate(context);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'FORBIDDEN_ROLE',
          messageKey: 'error.forbiddenRole',
        }),
      );
    }
  });
});
