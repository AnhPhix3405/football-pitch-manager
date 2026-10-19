import { SetMetadata } from '@nestjs/common';

export const CHECK_FIELD_OWNERSHIP_KEY = 'check_field_ownership';

export interface FieldOwnershipOptions {
  param?: string;
  source?: 'params' | 'body' | 'query';
  allowAdmin?: boolean;
}

export const CheckFieldOwnership = (options?: FieldOwnershipOptions) =>
  SetMetadata(CHECK_FIELD_OWNERSHIP_KEY, {
    param: 'id',
    source: 'params',
    allowAdmin: true,
    ...options,
  });
