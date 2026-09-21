import { CallHandler, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { lastValueFrom, of } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('translates a response message key and unwraps its data', async () => {
    const translate = jest.fn().mockReturnValue('Đăng ký tài khoản thành công');
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      t: translate,
    } as unknown as I18nContext);
    const context = {} as ExecutionContext;
    const next: CallHandler = {
      handle: () =>
        of({
          messageKey: 'success.accountRegistered',
          data: { id: 'user-id' },
        }),
    };

    const response = await lastValueFrom(
      new ApiResponseInterceptor().intercept(context, next),
    );

    expect(translate).toHaveBeenCalledWith('success.accountRegistered', {
      args: undefined,
    });
    expect(response).toEqual({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: { id: 'user-id' },
    });
  });

  it('keeps responses without a message key unchanged', async () => {
    jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);
    const context = {} as ExecutionContext;
    const next: CallHandler = {
      handle: () => of({ status: 'ok' }),
    };

    const response = await lastValueFrom(
      new ApiResponseInterceptor().intercept(context, next),
    );

    expect(response).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });
});
