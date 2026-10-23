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
import { FieldAvailabilityController } from '../src/components/field/controllers/field-availability.controller';
import { FieldPricingController } from '../src/components/field/controllers/field-pricing.controller';
import { OwnerCourtTimelineController } from '../src/components/field/controllers/owner-court-timeline.controller';
import { OwnerFieldPricingController } from '../src/components/field/controllers/owner-field-pricing.controller';
import { FieldOwnershipGuard } from '../src/components/field/guards/field-ownership.guard';
import { FieldAvailabilityService } from '../src/components/field/services/field-availability.service';
import { FieldPricingCalculatorService } from '../src/components/field/services/field-pricing-calculator.service';
import { OwnerFieldPricingService } from '../src/components/field/services/owner-field-pricing.service';

describe('Day 5 Pricing and Availability API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockOwnerPricingService = {
    createPricing: jest.fn(),
    getPricingList: jest.fn(),
    updatePricing: jest.fn(),
    deletePricing: jest.fn(),
  };

  const mockPricingCalculatorService = {
    calculateQuote: jest.fn(),
  };

  const mockAvailabilityService = {
    checkCourtTypeAvailability: jest.fn(),
    getCourtTimeline: jest.fn(),
    validateCourtAssignment: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        OwnerFieldPricingController,
        FieldPricingController,
        FieldAvailabilityController,
        OwnerCourtTimelineController,
      ],
      providers: [
        {
          provide: OwnerFieldPricingService,
          useValue: mockOwnerPricingService,
        },
        {
          provide: FieldPricingCalculatorService,
          useValue: mockPricingCalculatorService,
        },
        {
          provide: FieldAvailabilityService,
          useValue: mockAvailabilityService,
        },
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

  it('POST /owner/fields/:fieldId/pricing creates a pricing rule', async () => {
    mockOwnerPricingService.createPricing.mockResolvedValue({
      id: 'pricing-1',
      fieldId: 'field-1',
      courtType: '5',
      dayType: 'weekday',
      startTime: '06:00',
      endTime: '17:00',
      price: 200000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/pricing',
      payload: {
        courtType: '5',
        dayType: 'weekday',
        startTime: '06:00',
        endTime: '17:00',
        price: 200000,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveProperty('id', 'pricing-1');
    expect(body.data.price).toBe(200000);
  });

  it('POST /owner/fields/:fieldId/pricing handles 409 conflict when overlap detected', async () => {
    mockOwnerPricingService.createPricing.mockRejectedValue(
      new ApplicationException({
        code: 'PRICING_SLOT_OVERLAP',
        messageKey: 'error.pricingSlotOverlap',
        status: HttpStatus.CONFLICT,
      }),
    );

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/field-1/pricing',
      payload: {
        courtType: '5',
        dayType: 'weekday',
        startTime: '08:00',
        endTime: '12:00',
        price: 200000,
      },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('PRICING_SLOT_OVERLAP');
  });

  it('GET /owner/fields/:fieldId/pricing returns pricing rules', async () => {
    mockOwnerPricingService.getPricingList.mockResolvedValue([
      {
        id: 'pricing-1',
        courtType: '5',
        price: 200000,
      },
    ]);

    const res = await app.inject({
      method: 'GET',
      url: '/owner/fields/field-1/pricing?courtType=5',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('pricing-1');
  });

  it('GET /fields/:fieldId/pricing/quote calculates pricing quote', async () => {
    mockPricingCalculatorService.calculateQuote.mockResolvedValue({
      fieldId: 'field-1',
      courtType: '5',
      date: '2026-10-26',
      dayType: 'weekday',
      startTime: '16:00',
      endTime: '18:00',
      totalDurationMinutes: 120,
      totalPrice: 500000,
      breakdown: [
        {
          startTime: '16:00',
          endTime: '17:00',
          durationMinutes: 60,
          hourlyRate: 200000,
          subtotal: 200000,
        },
        {
          startTime: '17:00',
          endTime: '18:00',
          durationMinutes: 60,
          hourlyRate: 300000,
          subtotal: 300000,
        },
      ],
    });

    const res = await app.inject({
      method: 'GET',
      url: '/fields/field-1/pricing/quote?courtType=5&date=2026-10-26&startTime=16:00&endTime=18:00',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.totalPrice).toBe(500000);
    expect(body.data.breakdown).toHaveLength(2);
  });

  it('GET /fields/:fieldId/availability returns availability status', async () => {
    mockAvailabilityService.checkCourtTypeAvailability.mockResolvedValue({
      fieldId: 'field-1',
      date: '2026-10-26',
      startTime: '08:00',
      endTime: '10:00',
      isOpen: true,
      courtTypes: [
        {
          courtType: '5',
          totalCourts: 3,
          availableCourts: 2,
          isAvailable: true,
          availableCourtIds: ['c-1', 'c-2'],
        },
      ],
    });

    const res = await app.inject({
      method: 'GET',
      url: '/fields/field-1/availability?date=2026-10-26&startTime=08:00&endTime=10:00&courtType=5',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.isOpen).toBe(true);
    expect(body.data.courtTypes[0].availableCourts).toBe(2);
  });

  it('GET /owner/fields/:fieldId/courts/timeline returns court timeline', async () => {
    mockAvailabilityService.getCourtTimeline.mockResolvedValue({
      fieldId: 'field-1',
      date: '2026-10-26',
      openTime: '06:00',
      closeTime: '22:00',
      isClosed: false,
      courts: [
        {
          courtId: 'c-1',
          courtName: 'Sân 1',
          courtType: '5',
          status: 'active',
          blockedSlots: [],
          bookings: [],
        },
      ],
    });

    const res = await app.inject({
      method: 'GET',
      url: '/owner/fields/field-1/courts/timeline?date=2026-10-26',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.courts).toHaveLength(1);
    expect(body.data.courts[0].courtName).toBe('Sân 1');
  });
});
