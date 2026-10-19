/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { CHECK_FIELD_OWNERSHIP_KEY } from '../decorators/check-field-ownership.decorator';
import { FieldOwnershipGuard } from './field-ownership.guard';

describe('FieldOwnershipGuard', () => {
  let guard: FieldOwnershipGuard;
  let reflector: jest.Mocked<Reflector>;
  let fieldRepository: jest.Mocked<FieldRepository>;

  const validUuid = '1004b621-25f0-4537-9a4b-ef60bd66a9c4';
  const ownerId = 'owner-uuid-1';
  const otherOwnerId = 'owner-uuid-2';

  const mockField: FieldEntity = {
    id: validUuid,
    ownerId,
    name: 'Sân bóng Tân Bình Sport',
    address: '120 Hoàng Hoa Thám',
    district: 'Tân Bình',
    status: 'active',
  } as FieldEntity;

  const createMockContext = (
    requestData: Record<string, any>,
  ): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => requestData,
      }),
    } as unknown as ExecutionContext;
  };

  const expectGuardToThrow = async (
    context: ExecutionContext,
    expectedStatus: HttpStatus,
    expectedCode: string,
    expectedMessageKey?: string,
  ) => {
    try {
      await guard.canActivate(context);
      throw new Error('Guard should have thrown ApplicationException');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(expectedStatus);
      const res = error.getResponse();
      expect(res.code).toBe(expectedCode);
      if (expectedMessageKey) {
        expect(res.messageKey).toBe(expectedMessageKey);
      }
    }
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    fieldRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<FieldRepository>;

    guard = new FieldOwnershipGuard(reflector, fieldRepository);
  });

  it('allows access if route is marked as @Public()', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    const context = createMockContext({});
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(fieldRepository.findById).not.toHaveBeenCalled();
  });

  it('allows access if route has no @CheckFieldOwnership() metadata', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) return undefined;
      return undefined;
    });

    const context = createMockContext({});
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(fieldRepository.findById).not.toHaveBeenCalled();
  });

  it('throws 401 Unauthorized if request.user is missing', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    const context = createMockContext({
      params: { id: validUuid },
    });

    await expectGuardToThrow(context, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  });

  it('throws 400 Bad Request if field ID is invalid UUID', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    const context = createMockContext({
      user: { id: ownerId, role: 'owner' },
      params: { id: 'invalid-not-a-uuid' },
    });

    await expectGuardToThrow(
      context,
      HttpStatus.BAD_REQUEST,
      'INVALID_FIELD_ID',
      'error.invalidFieldId',
    );
    expect(fieldRepository.findById).not.toHaveBeenCalled();
  });

  it('throws 404 Not Found if field does not exist in DB for Owner', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(null);

    const context = createMockContext({
      user: { id: ownerId, role: 'owner' },
      params: { id: validUuid },
    });

    await expectGuardToThrow(
      context,
      HttpStatus.NOT_FOUND,
      'FIELD_NOT_FOUND',
      'error.fieldNotFound',
    );
    expect(fieldRepository.findById).toHaveBeenCalledWith(validUuid);
  });

  it('throws 404 Not Found even for Admin if field does not exist (PM Review Fix)', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(null);

    const context = createMockContext({
      user: { id: 'admin-uuid', role: 'admin' },
      params: { id: validUuid },
    });

    await expectGuardToThrow(
      context,
      HttpStatus.NOT_FOUND,
      'FIELD_NOT_FOUND',
      'error.fieldNotFound',
    );
    expect(fieldRepository.findById).toHaveBeenCalledWith(validUuid);
  });

  it('allows Admin access and attaches request.field if field exists (allowAdmin: true)', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(mockField);

    const request = {
      user: { id: 'admin-uuid', role: 'admin' },
      params: { id: validUuid },
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect((request as any).field).toBe(mockField);
  });

  it('throws 403 Forbidden if user is Owner but does not own the field (cross-owner IDOR)', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(mockField);

    const context = createMockContext({
      user: { id: otherOwnerId, role: 'owner' },
      params: { id: validUuid },
    });

    await expectGuardToThrow(
      context,
      HttpStatus.FORBIDDEN,
      'FIELD_ACCESS_DENIED',
      'error.forbiddenFieldAccess',
    );
  });

  it('allows Owner access and attaches request.field when ownership matches', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'id', source: 'params', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(mockField);

    const request = {
      user: { id: ownerId, role: 'owner' },
      params: { id: validUuid },
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect((request as any).field).toBe(mockField);
  });

  it('extracts fieldId from body when source is body', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'fieldId', source: 'body', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(mockField);

    const request = {
      user: { id: ownerId, role: 'owner' },
      body: { fieldId: validUuid, name: 'Sân 7' },
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(fieldRepository.findById).toHaveBeenCalledWith(validUuid);
    expect((request as any).field).toBe(mockField);
  });

  it('extracts fieldId from query when source is query', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      if (key === CHECK_FIELD_OWNERSHIP_KEY) {
        return { param: 'targetFieldId', source: 'query', allowAdmin: true };
      }
      return undefined;
    });

    fieldRepository.findById.mockResolvedValue(mockField);

    const request = {
      user: { id: ownerId, role: 'owner' },
      query: { targetFieldId: validUuid },
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(fieldRepository.findById).toHaveBeenCalledWith(validUuid);
    expect((request as any).field).toBe(mockField);
  });
});
