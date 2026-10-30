/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PaymentMethod } from '../constants/payment.constant';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { PaymentService } from '../services/payment.service';
import { UserPaymentController } from './user-payment.controller';

describe('UserPaymentController', () => {
  let controller: UserPaymentController;
  let paymentService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    paymentService = {
      selectPaymentMethod: jest.fn(),
    } as unknown as jest.Mocked<PaymentService>;

    controller = new UserPaymentController(paymentService);
  });

  it('calls selectPaymentMethod with correct arguments', async () => {
    const mockResponse = {
      id: 'tx-1',
      gateway: PaymentMethod.CASH,
    } as PaymentTransactionResponseDto;
    paymentService.selectPaymentMethod.mockResolvedValue(mockResponse);

    const result = await controller.selectPaymentMethod('user-1', 'booking-1', {
      method: PaymentMethod.CASH,
    });

    expect(paymentService.selectPaymentMethod).toHaveBeenCalledWith(
      'booking-1',
      'user-1',
      { method: PaymentMethod.CASH },
    );
    expect(result).toBe(mockResponse);
  });
});
