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
import { ApiRefund } from '../docs/refund.doc';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { RefundResponseDto } from '../dto/refund-response.dto';
import { RefundService } from '../services/refund.service';

@Controller('payments/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiRefund.apply()
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post(':bookingId/refund')
  @HttpCode(HttpStatus.OK)
  @ApiRefund.refundBooking()
  async refundBooking(
    @CurrentUser('id') actorUserId: string,
    @CurrentUser('role') actorRole: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: RefundPaymentDto,
  ): Promise<RefundResponseDto> {
    return this.refundService.processRefund(
      bookingId,
      actorUserId,
      actorRole,
      dto,
    );
  }
}
