export interface UploadFileOptions {
  path: string;
  fileBuffer: Buffer;
  contentType?: string;
  bucket?: string;
  upsert?: boolean;
}

export interface UploadedFileResult {
  path: string;
  fullPath: string;
  publicUrl?: string;
}

export interface IStorageService {
  uploadFile(options: UploadFileOptions): Promise<UploadedFileResult>;
  deleteFile(path: string, bucket?: string): Promise<void>;
  getPublicUrl(path: string, bucket?: string): string;
  createSignedUrl(
    path: string,
    expiresInSeconds: number,
    bucket?: string,
  ): Promise<string>;
}
