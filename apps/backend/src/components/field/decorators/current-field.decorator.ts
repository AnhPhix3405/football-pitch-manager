import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { FieldEntity } from '~/entities/field.entity';

export const CurrentField = createParamDecorator(
  (data: keyof FieldEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ field?: FieldEntity }>();
    const field = request.field;
    return data && field ? field[data] : field;
  },
);
