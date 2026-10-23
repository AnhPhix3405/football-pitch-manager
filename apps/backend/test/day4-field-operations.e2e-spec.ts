/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApplication } from '../src/common/configure-application';
import { ApplicationException } from '../src/common/exceptions/application.exception';
import { AccountStatusGuard } from '../src/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '../src/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/components/auth/guards/roles.guard';
import { OwnerBlockedSlotController } from '../src/components/field/controllers/owner-blocked-slot.controller';
import { OwnerFieldCourtController } from '../src/components/field/controllers/owner-field-court.controller';
import { OwnerFieldImageController } from '../src/components/field/controllers/owner-field-image.controller';
import { OwnerFieldOpeningHourController } from '../src/components/field/controllers/owner-field-opening-hour.controller';
import { OwnerFieldServiceController } from '../src/components/field/controllers/owner-field-service.controller';
import { FieldOwnershipGuard } from '../src/components/field/guards/field-ownership.guard';
import { OwnerBlockedSlotService } from '../src/components/field/services/owner-blocked-slot.service';
import { OwnerFieldCourtService } from '../src/components/field/services/owner-field-court.service';
import { OwnerFieldImageService } from '../src/components/field/services/owner-field-image.service';
import { OwnerFieldOpeningHourService } from '../src/components/field/services/owner-field-opening-hour.service';
import { OwnerFieldServiceService } from '../src/components/field/services/owner-field-service.service';

describe('Day 4 Field Operations API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockCourtService = {
    createCourt: jest.fn(),
    getCourts: jest.fn(),
    getCourtDetail: jest.fn(),
    updateCourt: jest.fn(),
    deleteCourt: jest.fn(),
  };

  const mockImageService = {
    addImage: jest.fn(),
    getImages: jest.fn(),
    updateImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  const mockServiceService = {
    createService: jest.fn(),
    getServices: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
  };

  const mockOpeningHourService = {
    upsertOpeningHours: jest.fn(),
    getOpeningHours: jest.fn(),
  };

  const mockBlockedSlotService = {
    createBlockedSlot: jest.fn(),
    getBlockedSlots: jest.fn(),
    deleteBlockedSlot: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        OwnerFieldCourtController,
        OwnerFieldImageController,
        OwnerFieldServiceController,
        OwnerFieldOpeningHourController,
        OwnerBlockedSlotController,
      ],
      providers: [
        { provide: OwnerFieldCourtService, useValue: mockCourtService },
        { provide: OwnerFieldImageService, useValue: mockImageService },
        { provide: OwnerFieldServiceService, useValue: mockServiceService },
        {
          provide: OwnerFieldOpeningHourService,
          useValue: mockOpeningHourService,
        },
        { provide: OwnerBlockedSlotService, useValue: mockBlockedSlotService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AccountStatusGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(FieldOwnershipGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /owner/fields/:fieldId/courts creates a sub-court', async () => {
    mockCourtService.createCourt.mockResolvedValue({
      id: 'court-1',
      fieldId: 'field-1',
      name: 'Sân 1 (5 người)',
      type: '5',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/courts',
      payload: {
        name: 'Sân 1 (5 người)',
        type: '5',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('court-1');
  });

  it('POST /owner/fields/:fieldId/images adds a pitch image', async () => {
    mockImageService.addImage.mockResolvedValue({
      id: 'img-1',
      fieldId: 'field-1',
      url: 'https://example.com/pitch.jpg',
      displayOrder: 0,
      isThumbnail: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/images',
      payload: {
        url: 'https://example.com/pitch.jpg',
        isThumbnail: true,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.isThumbnail).toBe(true);
  });

  it('POST /owner/fields/:fieldId/services creates an accompanying service', async () => {
    mockServiceService.createService.mockResolvedValue({
      id: 'srv-1',
      fieldId: 'field-1',
      name: 'Thuê bóng thi đấu',
      price: 50000,
      unit: 'quả',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/services',
      payload: {
        name: 'Thuê bóng thi đấu',
        price: 50000,
        unit: 'quả',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.name).toBe('Thuê bóng thi đấu');
  });

  it('PUT /owner/fields/:fieldId/opening-hours updates weekly hours', async () => {
    mockOpeningHourService.upsertOpeningHours.mockResolvedValue([
      {
        id: 'h-1',
        fieldId: 'field-1',
        dayOfWeek: 1,
        openTime: '06:00',
        closeTime: '22:00',
        isClosed: false,
      },
    ]);

    const res = await app.inject({
      method: 'PUT',
      url: '/owner/fields/field-1/opening-hours',
      payload: {
        hours: [
          {
            dayOfWeek: 1,
            openTime: '06:00',
            closeTime: '22:00',
            isClosed: false,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveLength(1);
  });

  it('POST /owner/fields/:fieldId/courts/:courtId/blocked-slots locks court slot', async () => {
    mockBlockedSlotService.createBlockedSlot.mockResolvedValue({
      id: 'slot-1',
      fieldCourtId: 'court-1',
      blockedDate: '2026-10-25',
      startTime: '08:00',
      endTime: '10:00',
      reason: 'Bảo trì',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/courts/court-1/blocked-slots',
      payload: {
        blockedDate: '2026-10-25',
        startTime: '08:00',
        endTime: '10:00',
        reason: 'Bảo trì',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('slot-1');
  });

  it('POST /owner/fields/:fieldId/courts/:courtId/blocked-slots handles 409 conflict when overlap detected', async () => {
    mockBlockedSlotService.createBlockedSlot.mockRejectedValue(
      new ApplicationException({
        code: 'BLOCKED_SLOT_OVERLAP',
        messageKey: 'error.blockedSlotOverlap',
        status: HttpStatus.CONFLICT,
      }),
    );

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/courts/court-1/blocked-slots',
      payload: {
        blockedDate: '2026-10-25',
        startTime: '08:30',
        endTime: '09:30',
      },
    });

    expect(res.statusCode).toBe(409);
  });
});
