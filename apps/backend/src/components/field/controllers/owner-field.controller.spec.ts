jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { CreateFieldDto } from '../dto/create-field.dto';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { OwnerFieldService } from '../services/owner-field.service';
import { OwnerFieldController } from './owner-field.controller';

describe('OwnerFieldController', () => {
  let controller: OwnerFieldController;
  let service: jest.Mocked<OwnerFieldService>;

  const mockOwnerId = 'owner-123';
  const mockFieldResponse: FieldResponseDto = {
    id: 'field-123',
    ownerId: mockOwnerId,
    name: 'Sân bóng Tân Bình Sport',
    address: '120 Hoàng Hoa Thám',
    district: 'Tân Bình',
    lat: 10.798123,
    lng: 106.654321,
    description: 'Sân cỏ nhân tạo',
    status: 'pending',
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
      createField: jest.fn(),
      getOwnerFields: jest.fn(),
      getOwnerFieldDetail: jest.fn(),
      updateField: jest.fn(),
      deactivateField: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldService>;

    controller = new OwnerFieldController(service);
  });

  it('createField delegates to OwnerFieldService', async () => {
    const dto: CreateFieldDto = {
      name: 'Sân bóng Tân Bình Sport',
      address: '120 Hoàng Hoa Thám',
    };
    service.createField.mockResolvedValue(mockFieldResponse);

    const result = await controller.createField(mockOwnerId, dto);

    expect(service.createField).toHaveBeenCalledWith(mockOwnerId, dto);
    expect(result).toEqual(mockFieldResponse);
  });

  it('getOwnerFields delegates to OwnerFieldService', async () => {
    service.getOwnerFields.mockResolvedValue(mockListResponse);

    const result = await controller.getOwnerFields(mockOwnerId, { page: 1, limit: 10 });

    expect(service.getOwnerFields).toHaveBeenCalledWith(mockOwnerId, { page: 1, limit: 10 });
    expect(result).toEqual(mockListResponse);
  });

  it('getOwnerFieldDetail delegates to OwnerFieldService', async () => {
    service.getOwnerFieldDetail.mockResolvedValue(mockFieldResponse);

    const result = await controller.getOwnerFieldDetail(mockOwnerId, 'field-123');

    expect(service.getOwnerFieldDetail).toHaveBeenCalledWith('field-123', mockOwnerId);
    expect(result).toEqual(mockFieldResponse);
  });

  it('updateField delegates to OwnerFieldService', async () => {
    const dto: UpdateFieldDto = { name: 'Sân Mới' };
    service.updateField.mockResolvedValue({ ...mockFieldResponse, name: 'Sân Mới' });

    const result = await controller.updateField(mockOwnerId, 'field-123', dto);

    expect(service.updateField).toHaveBeenCalledWith('field-123', mockOwnerId, dto);
    expect(result.name).toBe('Sân Mới');
  });

  it('deactivateField delegates to OwnerFieldService', async () => {
    service.deactivateField.mockResolvedValue({ ...mockFieldResponse, status: 'inactive' });

    const result = await controller.deactivateField(mockOwnerId, 'field-123');

    expect(service.deactivateField).toHaveBeenCalledWith('field-123', mockOwnerId);
    expect(result.status).toBe('inactive');
  });
});
