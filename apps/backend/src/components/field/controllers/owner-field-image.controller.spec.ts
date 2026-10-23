/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerFieldImageController } from './owner-field-image.controller';
import { OwnerFieldImageService } from '../services/owner-field-image.service';

describe('OwnerFieldImageController', () => {
  let controller: OwnerFieldImageController;
  let service: jest.Mocked<OwnerFieldImageService>;

  beforeEach(() => {
    service = {
      addImage: jest.fn(),
      getImages: jest.fn(),
      updateImage: jest.fn(),
      deleteImage: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldImageService>;

    controller = new OwnerFieldImageController(service);
  });

  it('delegates addImage to service', async () => {
    const mockRes = {
      id: 'img-1',
      url: 'https://example.com/pitch.jpg',
    } as any;
    service.addImage.mockResolvedValue(mockRes);

    const result = await controller.addImage('field-1', {
      url: 'https://example.com/pitch.jpg',
    });

    expect(service.addImage).toHaveBeenCalledWith('field-1', {
      url: 'https://example.com/pitch.jpg',
    });
    expect(result).toBe(mockRes);
  });
});
