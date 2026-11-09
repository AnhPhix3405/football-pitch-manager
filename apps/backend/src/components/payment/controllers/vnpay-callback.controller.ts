import { isUUID } from 'class-validator';
import type { FastifyReply } from 'fastify';
import { TransactionRepository } from '~/repositories/transaction.repository';
import { ManagedBookingPaymentService } from '../services/managed-booking-payment.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiUserPayment } from '../docs/payment.doc';
import { CreateVnpayUrlDto } from '../dto/create-vnpay-url.dto';
import { VnpayCallbackQueryDto } from '../dto/vnpay-callback-query.dto';
import { VnpayUrlResponseDto } from '../dto/vnpay-url-response.dto';
import { PaymentService } from '../services/payment.service';
import { VnpayIpnService } from '../services/vnpay-ipn.service';
import { VnpayService } from '../services/vnpay.service';

@Controller('payments/vnpay')
export class VnpayCallbackController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly vnpayService: VnpayService,
    private readonly vnpayIpnService: VnpayIpnService,
    private readonly transactions: TransactionRepository,
    private readonly managed: ManagedBookingPaymentService,
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
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.vnpayIpnService.processIpn(query);
    void reply.send(result);
  }

  @Get('return')
  @HttpCode(HttpStatus.OK)
  async handleReturn(@Query() query: VnpayCallbackQueryDto) {
    const reference = query.vnp_TxnRef;
    const transaction =
      reference && isUUID(reference)
        ? await this.transactions.findById(reference)
        : null;
    if (transaction?.merchantId)
      return this.managed.returnStatus(transaction, query);
    const isValid = Boolean(
      transaction?.gateway === 'vnpay' &&
      this.vnpayService.verifySecureHash(query),
    );
    return {
      isValid,
      isSuccess: isValid && transaction?.status === 'success',
      status: isValid ? transaction?.status : 'failed',
      txnRef: reference,
      transactionNo: transaction?.gatewayRef,
      amount: Number(transaction?.amount ?? 0),
      bankCode: query.vnp_BankCode,
    };
  }
}
