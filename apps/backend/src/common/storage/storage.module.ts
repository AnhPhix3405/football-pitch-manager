import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { storageConfig } from '~/config/storage.config';
import { STORAGE_SERVICE_TOKEN } from './constants/storage.constant';
import { SupabaseStorageService } from './services/supabase-storage.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    SupabaseStorageService,
    {
      provide: STORAGE_SERVICE_TOKEN,
      useExisting: SupabaseStorageService,
    },
  ],
  exports: [SupabaseStorageService, STORAGE_SERVICE_TOKEN],
})
export class StorageModule {}
