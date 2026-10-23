/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldImageEntity } from '~/entities/field-image.entity';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { OwnerFieldImageService } from './owner-field-image.service';

describe('OwnerFieldImageService', () => {
  let service: OwnerFieldImageService;
  let imageRepository: jest.Mocked<FieldImageRepository>;

  beforeEach(() => {
    imageRepository = {
      findByFieldId: jest.fn(),
      findByIdAndFieldId: jest.fn(),
      findThumbnail: jest.fn(),
      setThumbnailTransactional: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<FieldImageRepository>;

    service = new OwnerFieldImageService(imageRepository);
  });

  describe('addImage', () => {
    it('creates image and sets as thumbnail when isThumbnail is true', async () => {
      const mockImage = {
        id: 'img-1',
        fieldId: 'field-1',
        url: 'https://example.com/pitch.jpg',
        displayOrder: 0,
        isThumbnail: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FieldImageEntity;

      imageRepository.create.mockReturnValue(mockImage);
      imageRepository.save.mockResolvedValue(mockImage);
      imageRepository.setThumbnailTransactional.mockResolvedValue(mockImage);

      const result = await service.addImage('field-1', {
        url: 'https://example.com/pitch.jpg',
        isThumbnail: true,
      });

      expect(result.id).toBe('img-1');
      expect(imageRepository.setThumbnailTransactional).toHaveBeenCalledWith(
        'field-1',
        'img-1',
      );
    });
  });

  describe('deleteImage', () => {
    it('throws 404 NotFound when image does not exist in field', async () => {
      imageRepository.findByIdAndFieldId.mockResolvedValue(null);

      try {
        await service.deleteImage('field-1', 'invalid-img');
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
          code: 'IMAGE_NOT_FOUND',
        });
      }
    });
  });
});
