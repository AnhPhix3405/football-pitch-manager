jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { FieldService } from '../services/field.service';
import { FieldController } from './field.controller';

describe('FieldController', () => {
  let controller: FieldController;
  let service: jest.Mocked<FieldService>;

  const mockFieldResponse: FieldResponseDto = {
    id: 'field-1',
    ownerId: 'owner-1',
    name: 'Sân bóng Chảo Lửa',
    address: '30 Phan Thúc Duyện',
    district: 'Tân Bình',
    lat: 10.8,
    lng: 106.66,
    description: 'Sân 7 người',
    status: 'active',
    requireDeposit: false,
    depositType: null,
    depositValue: null,
    createdAt: new Date('2026-10-04T10:00:00Z'),
    updatedAt: new Date('2026-10-04T10:00:00Z'),
  };

  const mockListResponse: FieldListResponseDto = {
    items: [mockFieldResponse],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    service = {
      getPublicFields: jest.fn(),
      getPublicFieldDetail: jest.fn(),
    } as unknown as jest.Mocked<FieldService>;

    controller = new FieldController(service);
  });

  it('getPublicFields delegates to FieldService', async () => {
    service.getPublicFields.mockResolvedValue(mockListResponse);

    const result = await controller.getPublicFields({ page: 1, limit: 10, district: 'Tân Bình' });

    expect(service.getPublicFields).toHaveBeenCalledWith({ page: 1, limit: 10, district: 'Tân Bình' });
    expect(result).toEqual(mockListResponse);
  });

  it('getPublicFieldDetail delegates to FieldService', async () => {
    service.getPublicFieldDetail.mockResolvedValue(mockFieldResponse);

    const result = await controller.getPublicFieldDetail('field-1');

    expect(service.getPublicFieldDetail).toHaveBeenCalledWith('field-1');
    expect(result).toEqual(mockFieldResponse);
  });
});
