jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldEntity } from '~/entities/field.entity';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { AdminFieldService } from './admin-field.service';

describe('AdminFieldService', () => {
  let service: AdminFieldService;
  let fieldRepository: jest.Mocked<FieldRepository>;
  let fieldCourtRepository: jest.Mocked<FieldCourtRepository>;
  let dataSource: jest.Mocked<DataSource>;

  const mockField: Partial<FieldEntity> = {
    id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    ownerId: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
    name: 'Sân bóng Thống Nhất',
    address: '138 Đào Duy Từ, Phường 6, Quận 10',
    district: 'Quận 10',
    lat: '10.762622',
    lng: '106.660172',
    description: 'Sân bóng tiêu chuẩn',
    status: 'active',
    requireDeposit: true,
    depositType: 'fixed',
    depositValue: '100000',
    createdAt: new Date('2026-10-01T00:00:00Z'),
    updatedAt: new Date('2026-10-01T00:00:00Z'),
    owner: {
      id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
      email: 'owner@example.com',
      phone: '0901234567',
    } as any,
  };

  const mockCourts: Partial<FieldCourtEntity>[] = [
    { id: 'c1', fieldId: mockField.id!, name: 'Sân 1', type: '5', status: 'active' },
    { id: 'c2', fieldId: mockField.id!, name: 'Sân 2', type: '5', status: 'active' },
    { id: 'c3', fieldId: mockField.id!, name: 'Sân 3', type: '7', status: 'inactive' },
  ];

  beforeEach(async () => {
    const mockFieldRepo = {
      findAdminFieldsWithPagination: jest.fn(),
      countAdminKpi: jest.fn(),
      countDepositRequired: jest.fn().mockResolvedValue(5),
      findById: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
      save: jest.fn(),
    };

    const mockCourtRepo = {
      findByFieldId: jest.fn(),
      countTotal: jest.fn(),
      count: jest.fn(),
    };

    const mockImageRepo = {
      findByFieldId: jest.fn().mockResolvedValue([]),
    };

    const mockServiceRepo = {
      findByFieldId: jest.fn().mockResolvedValue([]),
    };

    const mockOpeningHourRepo = {
      findByFieldId: jest.fn().mockResolvedValue([]),
    };

    const mockPricingRepo = {
      findByFieldId: jest.fn().mockResolvedValue([]),
    };

    const mockEntityManager = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === FieldEntity) {
          return {
            findOne: jest.fn().mockResolvedValue(mockField),
            save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
          };
        }
        if (entity === FieldCourtEntity) {
          return {
            update: jest.fn().mockResolvedValue({ affected: 3 }),
          };
        }
        return {};
      }),
    };

    const mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => cb(mockEntityManager)),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFieldService,
        { provide: FieldRepository, useValue: mockFieldRepo },
        { provide: FieldCourtRepository, useValue: mockCourtRepo },
        { provide: FieldImageRepository, useValue: mockImageRepo },
        { provide: FieldServiceRepository, useValue: mockServiceRepo },
        { provide: FieldOpeningHourRepository, useValue: mockOpeningHourRepo },
        { provide: FieldPricingRepository, useValue: mockPricingRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AdminFieldService>(AdminFieldService);
    fieldRepository = module.get(FieldRepository);
    fieldCourtRepository = module.get(FieldCourtRepository);
    dataSource = module.get(DataSource);
  });

  describe('getFields', () => {
    it('should return paginated admin fields with aggregated court and deposit info', async () => {
      fieldRepository.findAdminFieldsWithPagination.mockResolvedValue({
        items: [mockField as FieldEntity],
        total: 1,
      });
      fieldCourtRepository.findByFieldId.mockResolvedValue(mockCourts as FieldCourtEntity[]);

      const result = await service.getFields({ page: 1, limit: 10, status: 'ALL' });

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe('Sân bóng Thống Nhất');
      expect(result.items[0].depositFormatted).toContain('100.000');
      expect(result.items[0].courtsSummary.total).toBe(3);
      expect(result.items[0].courtsSummary.type5).toBe(2);
      expect(result.items[0].courtsSummary.type7).toBe(1);
      expect(result.items[0].courtsSummary.activeCount).toBe(2);
    });
  });

  describe('getKpi', () => {
    it('should calculate system-wide field KPI metrics', async () => {
      fieldRepository.countAdminKpi.mockResolvedValue({
        totalFields: 10,
        activeFields: 8,
        inactiveFields: 1,
        pendingFields: 1,
        rejectedFields: 0,
      });
      fieldCourtRepository.countTotal.mockResolvedValue(25);
      fieldRepository.countDepositRequired.mockResolvedValue(6);

      const kpi = await service.getKpi();

      expect(kpi.totalFields).toBe(10);
      expect(kpi.activeFields).toBe(8);
      expect(kpi.totalCourts).toBe(25);
      expect(kpi.depositRequiredCount).toBe(6);
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if field does not exist', async () => {
      (dataSource.transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(null),
          }),
        });
      });

      await expect(
        service.updateStatus('non-existent-id', { status: 'inactive' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should cascade deactivate all courts when field status is changed to inactive', async () => {
      const updateCourtMock = jest.fn().mockResolvedValue({ affected: 3 });
      const saveFieldMock = jest.fn().mockImplementation((f) => Promise.resolve({ ...f, status: 'inactive' }));

      (dataSource.transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          getRepository: (entity: any) => {
            if (entity === FieldEntity) {
              return {
                findOne: jest.fn().mockResolvedValue({ ...mockField }),
                save: saveFieldMock,
              };
            }
            if (entity === FieldCourtEntity) {
              return {
                update: updateCourtMock,
              };
            }
            return {};
          },
        });
      });

      fieldCourtRepository.findByFieldId.mockResolvedValue([]);

      const result = await service.updateStatus(mockField.id!, {
        status: 'inactive',
        reason: 'Vi phạm quy chế đặt sân',
      });

      expect(updateCourtMock).toHaveBeenCalledWith(
        { fieldId: mockField.id },
        { status: 'inactive' },
      );
      expect(result.status).toBe('inactive');
    });
  });
});
