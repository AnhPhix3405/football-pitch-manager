import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { ApiErrorDetail, ApiErrorResponse } from '../dto/api-response.dto';

interface HttpExceptionBody {
  code?: unknown;
  message?: unknown;
  messageKey?: unknown;
  details?: unknown;
  error?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const reply = context.getResponse<FastifyReply>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      const trace = exception instanceof Error ? exception.stack : undefined;
      this.logger.error('Unhandled HTTP exception', trace);
    }

    const response: ApiErrorResponse = {
      success: false,
      error: this.toErrorDetail(exception, status, I18nContext.current(host)),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    void reply.status(status).send(response);
  }

  private toErrorDetail(
    exception: unknown,
    status: HttpStatus,
    i18n: I18nContext | undefined,
  ): ApiErrorDetail {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: this.translate(
          i18n,
          'error.internalServerError',
          'Internal server error',
        ),
      };
    }

    const response = exception.getResponse();
    if (typeof response === 'string') {
      return { code: this.statusToCode(status), message: response };
    }

    const body = response as HttpExceptionBody;
    const validationMessages = Array.isArray(body.message)
      ? body.message.filter(
          (message): message is string => typeof message === 'string',
        )
      : undefined;
    const message = validationMessages
      ? this.translate(i18n, 'error.validationFailed', 'Validation failed')
      : typeof body.messageKey === 'string'
        ? this.translate(i18n, body.messageKey, 'Request failed')
        : typeof body.message === 'string'
          ? body.message
          : typeof body.error === 'string'
            ? body.error
            : this.translate(i18n, 'error.requestFailed', 'Request failed');
    const details = validationMessages ?? body.details;

    return {
      code:
        typeof body.code === 'string'
          ? body.code
          : validationMessages
            ? 'VALIDATION_ERROR'
            : this.statusToCode(status),
      message,
      ...(details === undefined ? {} : { details }),
    };
  }

  private statusToCode(status: HttpStatus): string {
    return HttpStatus[status] ?? 'HTTP_ERROR';
  }

  private translate(
    i18n: I18nContext | undefined,
    key: string,
    fallback: string,
  ): string {
    if (!i18n) {
      return fallback;
    }

    const translated = i18n.t(key);
    return typeof translated === 'string' && translated !== key
      ? translated
      : fallback;
  }
}
