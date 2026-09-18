import { HttpException, HttpStatus } from '@nestjs/common';

export interface ApplicationExceptionOptions {
  code: string;
  message: string;
  status?: HttpStatus;
  details?: unknown;
}

export class ApplicationException extends HttpException {
  constructor(options: ApplicationExceptionOptions) {
    const { code, message, details, status = HttpStatus.BAD_REQUEST } = options;

    super(
      { code, message, ...(details === undefined ? {} : { details }) },
      status,
    );
  }
}
