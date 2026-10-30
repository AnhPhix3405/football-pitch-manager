import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { ApiOwnerPayment } from '../docs/payment.doc';
import { ConfirmCashPaymentDto } from '../dto/confirm-cash-payment.dto';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { PaymentService } from '../services/payment.service';

@Controller('owner/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiOwnerPayment.apply()
export class OwnerPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':bookingId/confirm-cash')
  @HttpCode(HttpStatus.OK)
  @ApiOwnerPayment.confirmCashPayment()
  async confirmCashPayment(
    @CurrentUser('id') ownerUserId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: ConfirmCashPaymentDto,
  ): Promise<PaymentTransactionResponseDto> {
    return this.paymentService.confirmCashPayment(bookingId, ownerUserId, dto);
  }
}
