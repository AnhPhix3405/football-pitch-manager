/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { CheckAvailabilityQueryDto } from '../dto/check-availability-query.dto';
import { FieldAvailabilityResponseDto } from '../dto/field-availability-response.dto';
import { FieldAvailabilityService } from '../services/field-availability.service';
import { FieldAvailabilityController } from './field-availability.controller';

describe('FieldAvailabilityController', () => {
  let controller: FieldAvailabilityController;
  let service: jest.Mocked<FieldAvailabilityService>;

  beforeEach(() => {
    service = {
      checkCourtTypeAvailability: jest.fn(),
      getCourtTimeline: jest.fn(),
      validateCourtAssignment: jest.fn(),
    } as unknown as jest.Mocked<FieldAvailabilityService>;

    controller = new FieldAvailabilityController(service);
  });

  it('delegates checkAvailability to service', async () => {
    const query: CheckAvailabilityQueryDto = {
      date: '2026-10-26',
      startTime: '08:00',
      endTime: '10:00',
    };
    const mockRes = {
      isOpen: true,
      courtTypes: [],
    } as unknown as FieldAvailabilityResponseDto;
    service.checkCourtTypeAvailability.mockResolvedValue(mockRes);

    const result = await controller.checkAvailability('f-1', query);
    expect(service.checkCourtTypeAvailability).toHaveBeenCalledWith(
      'f-1',
      query,
    );
    expect(result).toBe(mockRes);
  });
});
