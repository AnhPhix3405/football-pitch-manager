import { ConfigService } from '@nestjs/config';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { SupabaseStorageService } from './supabase-storage.service';

const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockCreateSignedUrl = jest.fn();

const mockFrom = jest.fn().mockReturnValue({
  upload: mockUpload,
  remove: mockRemove,
  getPublicUrl: mockGetPublicUrl,
  createSignedUrl: mockCreateSignedUrl,
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    storage: {
      from: mockFrom,
    },
  })),
}));

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'storage.supabaseUrl') return 'https://test-project.supabase.co';
        if (key === 'storage.supabaseKey') return 'test-service-role-key';
        if (key === 'storage.supabaseBucket') return 'test-bucket';
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new SupabaseStorageService(configService);
  });

  describe('uploadFile', () => {
    it('uploads file successfully and returns publicUrl', async () => {
      mockUpload.mockResolvedValue({
        data: { path: 'fields/pitch1.png', fullPath: 'test-bucket/fields/pitch1.png' },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://test-project.supabase.co/storage/v1/object/public/test-bucket/fields/pitch1.png' },
      });

      const buffer = Buffer.from('test-image-content');
      const result = await service.uploadFile({
        path: '/fields/pitch1.png',
        fileBuffer: buffer,
        contentType: 'image/png',
      });

      expect(mockFrom).toHaveBeenCalledWith('test-bucket');
      expect(mockUpload).toHaveBeenCalledWith('fields/pitch1.png', buffer, {
        contentType: 'image/png',
        upsert: true,
      });
      expect(result.path).toBe('fields/pitch1.png');
      expect(result.publicUrl).toBe(
        'https://test-project.supabase.co/storage/v1/object/public/test-bucket/fields/pitch1.png',
      );
    });

    it('throws ApplicationException if upload fails', async () => {
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      await expect(
        service.uploadFile({
          path: 'fields/pitch1.png',
          fileBuffer: Buffer.from('test'),
        }),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('deleteFile', () => {
    it('removes file successfully', async () => {
      mockRemove.mockResolvedValue({
        data: [{ name: 'fields/pitch1.png' }],
        error: null,
      });

      await service.deleteFile('/fields/pitch1.png');

      expect(mockFrom).toHaveBeenCalledWith('test-bucket');
      expect(mockRemove).toHaveBeenCalledWith(['fields/pitch1.png']);
    });

    it('throws ApplicationException if delete fails', async () => {
      mockRemove.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      await expect(service.deleteFile('fields/pitch1.png')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('getPublicUrl', () => {
    it('returns publicUrl string', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/public/file.jpg' },
      });

      const url = service.getPublicUrl('/file.jpg');
      expect(url).toBe('https://supabase.co/storage/public/file.jpg');
    });
  });

  describe('createSignedUrl', () => {
    it('generates signed url successfully', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://supabase.co/storage/signed/file.jpg?token=abc' },
        error: null,
      });

      const signedUrl = await service.createSignedUrl('private/file.jpg', 3600);
      expect(signedUrl).toBe('https://supabase.co/storage/signed/file.jpg?token=abc');
    });

    it('throws ApplicationException if createSignedUrl fails', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      });

      await expect(service.createSignedUrl('private/file.jpg', 3600)).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('configuration missing', () => {
    it('throws STORAGE_CONFIGURATION_MISSING when client is not initialized', async () => {
      const emptyConfigService = {
        get: jest.fn(() => undefined),
      } as unknown as ConfigService;
      const unconfiguredService = new SupabaseStorageService(emptyConfigService);

      await expect(
        unconfiguredService.uploadFile({
          path: 'test.jpg',
          fileBuffer: Buffer.from('data'),
        }),
      ).rejects.toThrow(ApplicationException);
    });
  });
});
