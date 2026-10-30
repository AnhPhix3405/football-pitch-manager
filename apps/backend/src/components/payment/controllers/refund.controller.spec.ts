/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { RefundResponseDto } from '../dto/refund-response.dto';
import { RefundService } from '../services/refund.service';
import { RefundController } from './refund.controller';

describe('RefundController', () => {
  let controller: RefundController;
  let refundService: jest.Mocked<RefundService>;

  beforeEach(() => {
    refundService = {
      processRefund: jest.fn(),
    } as unknown as jest.Mocked<RefundService>;

    controller = new RefundController(refundService);
  });

  it('delegates to refundService.processRefund with current user and dto', async () => {
    const mockRes = {
      refundTransactionId: 'rf-1',
      paymentStatus: 'refunded',
    } as RefundResponseDto;
    refundService.processRefund.mockResolvedValue(mockRes);

    const result = await controller.refundBooking('owner-1', 'owner', 'b-1', {
      reason: 'Customer requested refund',
    });

    expect(result).toBe(mockRes);
    expect(refundService.processRefund).toHaveBeenCalledWith(
      'b-1',
      'owner-1',
      'owner',
      { reason: 'Customer requested refund' },
    );
  });
});
