import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export type CurrentUserProperty = keyof JwtPayload | 'id';

export const CurrentUser = createParamDecorator(
  (data: CurrentUserProperty | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      return null;
    }

    if (data === 'id') {
      return user.sub;
    }

    return data ? user[data as keyof JwtPayload] : user;
  },
);
