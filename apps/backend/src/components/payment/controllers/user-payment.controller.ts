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
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiUserPayment } from '../docs/payment.doc';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { SelectPaymentMethodDto } from '../dto/select-payment-method.dto';
import { PaymentService } from '../services/payment.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiUserPayment.apply()
export class UserPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':bookingId/payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiUserPayment.selectPaymentMethod()
  async selectPaymentMethod(
    @CurrentUser('id') userId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: SelectPaymentMethodDto,
  ): Promise<PaymentTransactionResponseDto> {
    return this.paymentService.selectPaymentMethod(bookingId, userId, dto);
  }
}
