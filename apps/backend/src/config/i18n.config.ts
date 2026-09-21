import { join } from 'node:path';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nOptions,
  QueryResolver,
} from 'nestjs-i18n';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'vi',
  loader: I18nJsonLoader,
  loaderOptions: {
    path: join(__dirname, '../i18n'),
    watch: process.env.NODE_ENV !== 'production',
  },
  resolvers: [
    {
      use: QueryResolver,
      options: ['lang'],
    },
    {
      use: AcceptLanguageResolver,
      options: {
        matchType: 'strict-loose',
      },
    },
  ],
};
