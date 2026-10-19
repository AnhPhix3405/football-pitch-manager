import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { IS_PUBLIC_KEY } from '~/components/auth/decorators/public.decorator';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import {
  CHECK_FIELD_OWNERSHIP_KEY,
  FieldOwnershipOptions,
} from '../decorators/check-field-ownership.decorator';

interface RequestWithUser {
  user?: {
    id?: string;
    sub?: string;
    role: string;
  };
  field?: FieldEntity;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  [key: string]: unknown;
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Injectable()
export class FieldOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly fieldRepository: FieldRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const options = this.reflector.getAllAndOverride<FieldOwnershipOptions>(
      CHECK_FIELD_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ApplicationException({
        code: 'UNAUTHORIZED',
        messageKey: 'error.unauthorized',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const source = options.source ?? 'params';
    const paramKey = options.param ?? 'id';
    const sourceObj: Record<string, unknown> = request[source] ?? {};
    const fieldId = sourceObj[paramKey];

    if (!fieldId || typeof fieldId !== 'string' || !UUID_REGEX.test(fieldId)) {
      throw new ApplicationException({
        code: 'INVALID_FIELD_ID',
        messageKey: 'error.invalidFieldId',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const field = await this.fieldRepository.findById(fieldId);

    if (!field) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    request.field = field;

    const allowAdmin = options.allowAdmin ?? true;
    if (user.role === 'admin' && allowAdmin) {
      return true;
    }

    const userId = user.id ?? user.sub;
    if (field.ownerId !== userId) {
      throw new ApplicationException({
        code: 'FIELD_ACCESS_DENIED',
        messageKey: 'error.forbiddenFieldAccess',
        status: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}
