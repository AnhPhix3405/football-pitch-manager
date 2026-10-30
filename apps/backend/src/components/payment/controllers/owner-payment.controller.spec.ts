/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { PaymentService } from '../services/payment.service';
import { OwnerPaymentController } from './owner-payment.controller';

describe('OwnerPaymentController', () => {
  let controller: OwnerPaymentController;
  let paymentService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    paymentService = {
      confirmCashPayment: jest.fn(),
    } as unknown as jest.Mocked<PaymentService>;

    controller = new OwnerPaymentController(paymentService);
  });

  it('calls confirmCashPayment with correct arguments', async () => {
    const mockResponse = {
      id: 'tx-1',
      status: 'success',
    } as PaymentTransactionResponseDto;
    paymentService.confirmCashPayment.mockResolvedValue(mockResponse);

    const result = await controller.confirmCashPayment('owner-1', 'booking-1', {
      note: 'Received cash',
    });

    expect(paymentService.confirmCashPayment).toHaveBeenCalledWith(
      'booking-1',
      'owner-1',
      { note: 'Received cash' },
    );
    expect(result).toBe(mockResponse);
  });
});
