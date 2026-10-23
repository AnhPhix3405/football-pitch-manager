/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PriceQuoteQueryDto } from '../dto/price-quote-query.dto';
import { PriceQuoteResponseDto } from '../dto/price-quote-response.dto';
import { FieldPricingCalculatorService } from '../services/field-pricing-calculator.service';
import { FieldPricingController } from './field-pricing.controller';

describe('FieldPricingController', () => {
  let controller: FieldPricingController;
  let service: jest.Mocked<FieldPricingCalculatorService>;

  beforeEach(() => {
    service = {
      calculateQuote: jest.fn(),
      determineDayType: jest.fn(),
    } as unknown as jest.Mocked<FieldPricingCalculatorService>;

    controller = new FieldPricingController(service);
  });

  it('delegates getPriceQuote to service', async () => {
    const query: PriceQuoteQueryDto = {
      courtType: '5',
      date: '2026-10-26',
      startTime: '14:00',
      endTime: '16:00',
    };
    const mockRes = { totalPrice: 400000 } as PriceQuoteResponseDto;
    service.calculateQuote.mockResolvedValue(mockRes);

    const result = await controller.getPriceQuote('f-1', query);
    expect(service.calculateQuote).toHaveBeenCalledWith('f-1', query);
    expect(result).toBe(mockRes);
  });
});
