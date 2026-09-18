import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiErrorDetail, ApiErrorResponse } from '../dto/api-response.dto';

interface HttpExceptionBody {
  code?: unknown;
  message?: unknown;
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
      error: this.toErrorDetail(exception, status),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    void reply.status(status).send(response);
  }

  private toErrorDetail(
    exception: unknown,
    status: HttpStatus,
  ): ApiErrorDetail {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
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
      ? 'Validation failed'
      : typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : 'Request failed';
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
}
