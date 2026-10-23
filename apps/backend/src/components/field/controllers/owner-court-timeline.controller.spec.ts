/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { CourtTimelineQueryDto } from '../dto/court-timeline-query.dto';
import { CourtTimelineResponseDto } from '../dto/court-timeline-response.dto';
import { FieldAvailabilityService } from '../services/field-availability.service';
import { OwnerCourtTimelineController } from './owner-court-timeline.controller';

describe('OwnerCourtTimelineController', () => {
  let controller: OwnerCourtTimelineController;
  let service: jest.Mocked<FieldAvailabilityService>;

  beforeEach(() => {
    service = {
      checkCourtTypeAvailability: jest.fn(),
      getCourtTimeline: jest.fn(),
      validateCourtAssignment: jest.fn(),
    } as unknown as jest.Mocked<FieldAvailabilityService>;

    controller = new OwnerCourtTimelineController(service);
  });

  it('delegates getCourtTimeline to service', async () => {
    const query: CourtTimelineQueryDto = { date: '2026-10-26' };
    const mockRes = {
      fieldId: 'f-1',
      courts: [],
    } as unknown as CourtTimelineResponseDto;
    service.getCourtTimeline.mockResolvedValue(mockRes);

    const result = await controller.getCourtTimeline('f-1', query);
    expect(service.getCourtTimeline).toHaveBeenCalledWith('f-1', query);
    expect(result).toBe(mockRes);
  });

  it('delegates validateCourtAssignment to service', async () => {
    service.validateCourtAssignment.mockResolvedValue(true);

    const result = await controller.validateCourtAssignment(
      'f-1',
      'c-1',
      '5',
      '2026-10-26',
      '08:00',
      '10:00',
    );

    expect(service.validateCourtAssignment).toHaveBeenCalledWith(
      'c-1',
      'f-1',
      '5',
      '2026-10-26',
      '08:00',
      '10:00',
    );
    expect(result).toEqual({ valid: true });
  });
});
