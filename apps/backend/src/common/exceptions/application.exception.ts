import { HttpException, HttpStatus } from '@nestjs/common';

export interface ApplicationExceptionOptions {
  code: string;
  messageKey: string;
  status?: HttpStatus;
  details?: unknown;
}

export class ApplicationException extends HttpException {
  constructor(options: ApplicationExceptionOptions) {
    const {
      code,
      messageKey,
      details,
      status = HttpStatus.BAD_REQUEST,
    } = options;

    super(
      { code, messageKey, ...(details === undefined ? {} : { details }) },
      status,
    );
  }
}
