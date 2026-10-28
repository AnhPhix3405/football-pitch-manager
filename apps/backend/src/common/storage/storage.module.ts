import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '~/components/auth/auth.module';
import { storageConfig } from '~/config/storage.config';
import { STORAGE_SERVICE_TOKEN } from './constants/storage.constant';
import { UploadController } from './controllers/upload.controller';
import { SupabaseStorageService } from './services/supabase-storage.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(storageConfig), AuthModule],
  controllers: [UploadController],
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
