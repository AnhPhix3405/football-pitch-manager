import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new ApplicationException({
        code: 'UNAUTHORIZED_ACCESS',
        messageKey: 'error.unauthorizedAccess',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new ApplicationException({
        code: 'UNAUTHORIZED_ACCESS',
        messageKey: 'error.unauthorizedAccess',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = await this.tokenService.verifyAccessToken(token);
    request.user = payload;

    return true;
  }
}
