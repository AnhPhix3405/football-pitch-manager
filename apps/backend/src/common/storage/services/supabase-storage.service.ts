import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApplicationException } from '~/common/exceptions/application.exception';
import {
  IStorageService,
  UploadedFileResult,
  UploadFileOptions,
} from '../interfaces/storage-service.interface';

@Injectable()
export class SupabaseStorageService implements IStorageService {
  private readonly supabaseClient: SupabaseClient | null = null;
  private readonly defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('storage.supabaseUrl') ||
      process.env.SUPABASE_URL;
    const supabaseKey =
      this.configService.get<string>('storage.supabaseKey') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY;
    this.defaultBucket =
      this.configService.get<string>('storage.supabaseBucket') ||
      process.env.SUPABASE_STORAGE_BUCKET ||
      'football-pitch-manager';

    if (supabaseUrl && supabaseKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  private getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new ApplicationException({
        code: 'STORAGE_CONFIGURATION_MISSING',
        messageKey: 'error.storageConfigurationMissing',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
    return this.supabaseClient;
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadedFileResult> {
    const client = this.getClient();
    const bucket = options.bucket || this.defaultBucket;
    const cleanPath = options.path.startsWith('/')
      ? options.path.slice(1)
      : options.path;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(cleanPath, options.fileBuffer, {
        contentType: options.contentType,
        upsert: options.upsert ?? true,
      });

    if (error || !data) {
      throw new ApplicationException({
        code: 'STORAGE_UPLOAD_FAILED',
        messageKey: 'error.storageUploadFailed',
        status: HttpStatus.BAD_GATEWAY,
        details: { message: error?.message },
      });
    }

    const publicUrl = this.getPublicUrl(cleanPath, bucket);

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl,
    };
  }

  async deleteFile(path: string, bucket?: string): Promise<void> {
    const client = this.getClient();
    const targetBucket = bucket || this.defaultBucket;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { error } = await client.storage
      .from(targetBucket)
      .remove([cleanPath]);

    if (error) {
      throw new ApplicationException({
        code: 'STORAGE_DELETE_FAILED',
        messageKey: 'error.storageDeleteFailed',
        status: HttpStatus.BAD_GATEWAY,
        details: { message: error.message },
      });
    }
  }

  getPublicUrl(path: string, bucket?: string): string {
    const client = this.getClient();
    const targetBucket = bucket || this.defaultBucket;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { data } = client.storage.from(targetBucket).getPublicUrl(cleanPath);

    return data.publicUrl;
  }

  async createSignedUrl(
    path: string,
    expiresInSeconds: number,
    bucket?: string,
  ): Promise<string> {
    const client = this.getClient();
    const targetBucket = bucket || this.defaultBucket;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { data, error } = await client.storage
      .from(targetBucket)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data) {
      throw new ApplicationException({
        code: 'STORAGE_SIGNED_URL_FAILED',
        messageKey: 'error.storageSignedUrlFailed',
        status: HttpStatus.BAD_GATEWAY,
        details: { message: error?.message },
      });
    }

    return data.signedUrl;
  }
}
