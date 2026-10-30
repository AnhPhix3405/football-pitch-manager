import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiUserPayment } from '../docs/payment.doc';
import { CreateVnpayUrlDto } from '../dto/create-vnpay-url.dto';
import { VnpayCallbackQueryDto } from '../dto/vnpay-callback-query.dto';
import { VnpayUrlResponseDto } from '../dto/vnpay-url-response.dto';
import { VnpayIpnResponse } from '../interfaces/payment.interface';
import { PaymentService } from '../services/payment.service';
import { VnpayIpnService } from '../services/vnpay-ipn.service';
import { VnpayService } from '../services/vnpay.service';

@Controller('payments/vnpay')
export class VnpayCallbackController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly vnpayService: VnpayService,
    private readonly vnpayIpnService: VnpayIpnService,
  ) {}

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUserPayment.createVnpayUrl()
  async createVnpayUrl(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateVnpayUrlDto,
    @Ip() ipAddr: string,
  ): Promise<VnpayUrlResponseDto> {
    return this.paymentService.createVnpayUrl(
      userId,
      dto,
      ipAddr || '127.0.0.1',
    );
  }

  @Get('ipn')
  @HttpCode(HttpStatus.OK)
  async handleIpn(
    @Query() query: VnpayCallbackQueryDto,
  ): Promise<VnpayIpnResponse> {
    return this.vnpayIpnService.processIpn(query);
  }

  @Get('return')
  @HttpCode(HttpStatus.OK)
  handleReturn(@Query() query: VnpayCallbackQueryDto) {
    const isValid = this.vnpayService.verifySecureHash(query);
    const isSuccess = isValid && query.vnp_ResponseCode === '00';

    return {
      isValid,
      isSuccess,
      txnRef: query.vnp_TxnRef,
      transactionNo: query.vnp_TransactionNo,
      amount: query.vnp_Amount ? Number(query.vnp_Amount) / 100 : 0,
      bankCode: query.vnp_BankCode,
      message: isSuccess
        ? 'Giao dịch thành công'
        : 'Giao dịch không thành công hoặc chữ ký không hợp lệ',
    };
  }
}
