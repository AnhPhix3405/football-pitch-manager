/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { VnpayResponseCode } from '../constants/payment.constant';
import { PaymentService } from '../services/payment.service';
import { VnpayIpnService } from '../services/vnpay-ipn.service';
import { VnpayService } from '../services/vnpay.service';
import { VnpayCallbackController } from './vnpay-callback.controller';

describe('VnpayCallbackController', () => {
  let controller: VnpayCallbackController;
  let paymentService: jest.Mocked<PaymentService>;
  let vnpayService: jest.Mocked<VnpayService>;
  let vnpayIpnService: jest.Mocked<VnpayIpnService>;

  beforeEach(() => {
    paymentService = {
      createVnpayUrl: jest.fn(),
    } as unknown as jest.Mocked<PaymentService>;

    vnpayService = {
      verifySecureHash: jest.fn(),
    } as unknown as jest.Mocked<VnpayService>;

    vnpayIpnService = {
      processIpn: jest.fn(),
    } as unknown as jest.Mocked<VnpayIpnService>;

    controller = new VnpayCallbackController(
      paymentService,
      vnpayService,
      vnpayIpnService,
    );
  });

  it('createVnpayUrl delegates to paymentService', async () => {
    const mockRes = {
      paymentUrl: 'https://vnpay.vn/pay',
      txnRef: 'tx-1',
    };
    paymentService.createVnpayUrl.mockResolvedValue(mockRes);

    const result = await controller.createVnpayUrl(
      'user-1',
      { bookingId: 'b-1' },
      '127.0.0.1',
    );

    expect(result).toBe(mockRes);
    expect(paymentService.createVnpayUrl).toHaveBeenCalledWith(
      'user-1',
      { bookingId: 'b-1' },
      '127.0.0.1',
    );
  });

  it('handleIpn delegates to vnpayIpnService', async () => {
    const mockRes = {
      RspCode: VnpayResponseCode.SUCCESS,
      Message: 'Confirm Success',
    };
    vnpayIpnService.processIpn.mockResolvedValue(mockRes);

    const result = await controller.handleIpn({ vnp_TxnRef: 'tx-1' });
    expect(result).toBe(mockRes);
    expect(vnpayIpnService.processIpn).toHaveBeenCalledWith({
      vnp_TxnRef: 'tx-1',
    });
  });

  it('handleReturn verifies signature and returns success status', () => {
    vnpayService.verifySecureHash.mockReturnValue(true);

    const result = controller.handleReturn({
      vnp_ResponseCode: '00',
      vnp_TxnRef: 'tx-1',
      vnp_Amount: '10000000',
    });

    expect(result.isValid).toBe(true);
    expect(result.isSuccess).toBe(true);
    expect(result.amount).toBe(100000);
  });
});
