import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ACCOUNT_STATUS_KEY } from '../decorators/account-status.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.status === 'banned') {
      throw new ApplicationException({
        code: 'ACCOUNT_BANNED',
        messageKey: 'error.accountBanned',
        status: HttpStatus.FORBIDDEN,
      });
    }

    const allowedStatuses = this.reflector.getAllAndOverride<string[]>(
      ACCOUNT_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowedStatuses && allowedStatuses.length > 0) {
      if (!allowedStatuses.includes(user.status)) {
        throw new ApplicationException({
          code: 'ACCOUNT_STATUS_INVALID',
          messageKey: 'error.accountStatusInvalid',
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    return true;
  }
}
