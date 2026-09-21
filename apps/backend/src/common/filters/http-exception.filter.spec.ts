import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ApplicationException } from '../exceptions/application.exception';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('translates an application exception message key', () => {
    const translate = jest.fn().mockReturnValue('Email already exists');
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      t: translate,
    } as unknown as I18nContext);

    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/auth/register' }),
        getResponse: () => reply,
      }),
    } as unknown as ArgumentsHost;
    const exception = new ApplicationException({
      code: 'EMAIL_ALREADY_EXISTS',
      messageKey: 'error.emailAlreadyExists',
      status: HttpStatus.CONFLICT,
    });

    new HttpExceptionFilter().catch(exception, host);

    expect(translate).toHaveBeenCalledWith('error.emailAlreadyExists');
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(reply.send).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already exists',
      },
      path: '/auth/register',
      timestamp: expect.any(String) as string,
    });
  });
});
