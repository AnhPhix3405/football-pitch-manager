import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ACCOUNT_STATUS_KEY = 'allowedAccountStatuses';
export const AllowedStatuses = (...statuses: string[]): CustomDecorator<string> =>
  SetMetadata(ACCOUNT_STATUS_KEY, statuses);
