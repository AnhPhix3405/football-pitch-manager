import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Observable, map } from 'rxjs';
import {
  ApiSuccessResponse,
  TranslatableResponse,
} from '../dto/api-response.dto';

type ResponseData<T> = T extends TranslatableResponse<infer Data> ? Data : T;

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<ResponseData<T>>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<ResponseData<T>>> {
    const i18n = I18nContext.current(context);

    return next.handle().pipe(
      map((result) => {
        if (!this.isTranslatableResponse(result)) {
          return {
            success: true,
            data: result as ResponseData<T>,
          };
        }

        const translated = i18n?.t(result.messageKey, {
          args: result.messageArgs,
        });

        return {
          success: true,
          message:
            typeof translated === 'string' ? translated : result.messageKey,
          data: result.data as ResponseData<T>,
        };
      }),
    );
  }

  private isTranslatableResponse(
    value: unknown,
  ): value is TranslatableResponse<unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'messageKey' in value &&
      typeof value.messageKey === 'string' &&
      'data' in value
    );
  }
}
