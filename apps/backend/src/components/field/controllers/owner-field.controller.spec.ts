/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Reflector } from '@nestjs/core';
import { FieldEntity } from '~/entities/field.entity';
import { CHECK_FIELD_OWNERSHIP_KEY } from '../decorators/check-field-ownership.decorator';
import { CreateFieldDto } from '../dto/create-field.dto';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldService } from '../services/owner-field.service';
import { OwnerFieldController } from './owner-field.controller';

describe('OwnerFieldController', () => {
  let controller: OwnerFieldController;
  let service: jest.Mocked<OwnerFieldService>;

  const mockOwnerId = 'owner-123';
  const mockFieldEntity: FieldEntity = {
    id: 'field-123',
    ownerId: mockOwnerId,
    name: 'Sân bóng Tân Bình Sport',
    address: '120 Hoàng Hoa Thám',
    district: 'Tân Bình',
    lat: '10.7981230',
    lng: '106.6543210',
    description: 'Sân cỏ nhân tạo',
    status: 'pending',
    requireDeposit: true,
    depositType: 'fixed',
    depositValue: '100000.00',
    createdAt: new Date('2026-10-04T10:00:00Z'),
    updatedAt: new Date('2026-10-04T10:00:00Z'),
    owner: {} as any,
  };

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

  it('has FieldOwnershipGuard registered in controller guards', () => {
    const guards = Reflect.getMetadata('__guards__', OwnerFieldController);
    expect(guards).toContain(FieldOwnershipGuard);
  });

  it('has @CheckFieldOwnership configured on :id routes', () => {
    const reflector = new Reflector();
    const detailMetadata = reflector.get(
      CHECK_FIELD_OWNERSHIP_KEY,
      controller.getOwnerFieldDetail,
    );
    const updateMetadata = reflector.get(
      CHECK_FIELD_OWNERSHIP_KEY,
      controller.updateField,
    );
    const deactivateMetadata = reflector.get(
      CHECK_FIELD_OWNERSHIP_KEY,
      controller.deactivateField,
    );

    expect(detailMetadata).toEqual({
      param: 'id',
      source: 'params',
      allowAdmin: true,
    });
    expect(updateMetadata).toEqual({
      param: 'id',
      source: 'params',
      allowAdmin: true,
    });
    expect(deactivateMetadata).toEqual({
      param: 'id',
      source: 'params',
      allowAdmin: true,
    });
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

    const result = await controller.getOwnerFields(mockOwnerId, {
      page: 1,
      limit: 10,
    });

    expect(service.getOwnerFields).toHaveBeenCalledWith(mockOwnerId, {
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(mockListResponse);
  });

  it('getOwnerFieldDetail delegates to OwnerFieldService with injected FieldEntity', () => {
    service.getOwnerFieldDetail.mockReturnValue(mockFieldResponse);

    const result = controller.getOwnerFieldDetail(mockFieldEntity);

    expect(service.getOwnerFieldDetail).toHaveBeenCalledWith(mockFieldEntity);
    expect(result).toEqual(mockFieldResponse);
  });

  it('updateField delegates to OwnerFieldService with injected FieldEntity', async () => {
    const dto: UpdateFieldDto = { name: 'Sân Mới' };
    service.updateField.mockResolvedValue({
      ...mockFieldResponse,
      name: 'Sân Mới',
    });

    const result = await controller.updateField(
      mockOwnerId,
      mockFieldEntity,
      dto,
    );

    expect(service.updateField).toHaveBeenCalledWith(
      mockFieldEntity,
      mockOwnerId,
      dto,
    );
    expect(result.name).toBe('Sân Mới');
  });

  it('deactivateField delegates to OwnerFieldService with injected FieldEntity', async () => {
    service.deactivateField.mockResolvedValue({
      ...mockFieldResponse,
      status: 'inactive',
    });

    const result = await controller.deactivateField(mockFieldEntity);

    expect(service.deactivateField).toHaveBeenCalledWith(mockFieldEntity);
    expect(result.status).toBe('inactive');
  });
});
