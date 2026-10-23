/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { CreateFieldPricingDto } from '../dto/create-field-pricing.dto';
import { FieldPricingQueryDto } from '../dto/field-pricing-query.dto';
import { FieldPricingResponseDto } from '../dto/field-pricing-response.dto';
import { UpdateFieldPricingDto } from '../dto/update-field-pricing.dto';
import { OwnerFieldPricingService } from '../services/owner-field-pricing.service';
import { OwnerFieldPricingController } from './owner-field-pricing.controller';

describe('OwnerFieldPricingController', () => {
  let controller: OwnerFieldPricingController;
  let service: jest.Mocked<OwnerFieldPricingService>;

  beforeEach(() => {
    service = {
      createPricing: jest.fn(),
      getPricingList: jest.fn(),
      updatePricing: jest.fn(),
      deletePricing: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldPricingService>;

    controller = new OwnerFieldPricingController(service);
  });

  it('delegates createPricing to service', async () => {
    const dto: CreateFieldPricingDto = {
      courtType: '5',
      dayType: 'weekday',
      startTime: '06:00',
      endTime: '17:00',
      price: 200000,
    };
    const mockRes = { id: 'p-1' } as FieldPricingResponseDto;
    service.createPricing.mockResolvedValue(mockRes);

    const result = await controller.createPricing('f-1', dto);
    expect(service.createPricing).toHaveBeenCalledWith('f-1', dto);
    expect(result).toBe(mockRes);
  });

  it('delegates getPricingList to service', async () => {
    const query: FieldPricingQueryDto = { courtType: '5' };
    service.getPricingList.mockResolvedValue([]);

    const result = await controller.getPricingList('f-1', query);
    expect(service.getPricingList).toHaveBeenCalledWith('f-1', query);
    expect(result).toEqual([]);
  });

  it('delegates updatePricing to service', async () => {
    const dto: UpdateFieldPricingDto = { price: 250000 };
    const mockRes = { id: 'p-1', price: 250000 } as FieldPricingResponseDto;
    service.updatePricing.mockResolvedValue(mockRes);

    const result = await controller.updatePricing('f-1', 'p-1', dto);
    expect(service.updatePricing).toHaveBeenCalledWith('f-1', 'p-1', dto);
    expect(result).toBe(mockRes);
  });

  it('delegates deletePricing to service', async () => {
    service.deletePricing.mockResolvedValue({ success: true });

    const result = await controller.deletePricing('f-1', 'p-1');
    expect(service.deletePricing).toHaveBeenCalledWith('f-1', 'p-1');
    expect(result).toEqual({ success: true });
  });
});
