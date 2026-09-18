import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

describe('ApplicationException', () => {
  it('keeps the API error contract and HTTP status', () => {
    const exception = new ApplicationException({
      code: 'RESOURCE_CONFLICT',
      message: 'Resource already exists',
      status: HttpStatus.CONFLICT,
      details: { field: 'name' },
    });

    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(exception.getResponse()).toEqual({
      code: 'RESOURCE_CONFLICT',
      message: 'Resource already exists',
      details: { field: 'name' },
    });
  });
});
