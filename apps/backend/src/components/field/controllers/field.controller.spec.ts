/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { PublicFieldQueryDto } from '../dto/public-field-query.dto';
import { FieldService } from '../services/field.service';
import { FieldController } from './field.controller';

describe('FieldController', () => {
  let controller: FieldController;
  let service: jest.Mocked<FieldService>;

  const validFieldId = 'd3b07384-d113-40e1-95b6-75399589d6e4';
  const mockFieldResponse: FieldResponseDto = {
    id: validFieldId,
    ownerId: 'b7c12345-d113-40e1-95b6-75399589d6e4',
    name: 'Sân bóng Chảo Lửa',
    address: '30 Phan Thúc Duyện',
    district: 'Tân Bình',
    lat: 10.8,
    lng: 106.66,
    description: 'Sân 7 người',
    status: 'active',
    requireDeposit: true,
    depositType: 'fixed',
    depositValue: 100000,
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

  it('getPublicFields delegates all query parameters to FieldService', async () => {
    service.getPublicFields.mockResolvedValue(mockListResponse);

    const query: PublicFieldQueryDto = {
      page: 1,
      limit: 10,
      search: 'Chảo Lửa',
      district: 'Tân Bình',
      requireDeposit: true,
      sortBy: 'name',
      sortOrder: 'ASC',
    };

    const result = await controller.getPublicFields(query);

    expect(service.getPublicFields).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockListResponse);
  });

  it('getPublicFieldDetail delegates ID to FieldService', async () => {
    service.getPublicFieldDetail.mockResolvedValue(mockFieldResponse);

    const result = await controller.getPublicFieldDetail(validFieldId);

    expect(service.getPublicFieldDetail).toHaveBeenCalledWith(validFieldId);
    expect(result).toEqual(mockFieldResponse);
  });
});
