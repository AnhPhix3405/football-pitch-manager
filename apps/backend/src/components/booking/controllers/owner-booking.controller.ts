import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { CheckFieldOwnership } from '~/components/field/decorators/check-field-ownership.decorator';
import { FieldOwnershipGuard } from '~/components/field/guards/field-ownership.guard';
import { ApiOwnerBooking } from '../docs/owner-booking.doc';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { OwnerBookingQueryDto } from '../dto/owner-booking-query.dto';
import { RejectBookingDto } from '../dto/reject-booking.dto';
import { OwnerBookingService } from '../services/owner-booking.service';

@ApiOwnerBooking.apply()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/bookings')
export class OwnerBookingController {
  constructor(private readonly ownerBookingService: OwnerBookingService) {}

  @Get()
  @ApiOwnerBooking.getOwnerBookings()
  async getOwnerBookings(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Query() query: OwnerBookingQueryDto,
  ) {
    return this.ownerBookingService.getOwnerBookings(fieldId, query);
  }

  @Get(':bookingId')
  @ApiOwnerBooking.getBookingDetail()
  async getBookingDetail(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingResponseDto> {
    return this.ownerBookingService.getBookingDetail(fieldId, bookingId);
  }

  @Post(':bookingId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOwnerBooking.confirmBooking()
  async confirmBooking(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') ownerUserId: string,
    @Body() dto: ConfirmBookingDto,
  ): Promise<BookingResponseDto> {
    return this.ownerBookingService.confirmBooking(
      fieldId,
      bookingId,
      ownerUserId,
      dto,
    );
  }

  @Post(':bookingId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOwnerBooking.rejectBooking()
  async rejectBooking(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') ownerUserId: string,
    @Body() dto: RejectBookingDto,
  ): Promise<BookingResponseDto> {
    return this.ownerBookingService.rejectBooking(
      fieldId,
      bookingId,
      ownerUserId,
      dto,
    );
  }

  @Post(':bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOwnerBooking.cancelBooking()
  async cancelBooking(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') ownerUserId: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return this.ownerBookingService.cancelBooking(
      fieldId,
      bookingId,
      ownerUserId,
      dto,
    );
  }

  @Post(':bookingId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOwnerBooking.completeBooking()
  async completeBooking(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') ownerUserId: string,
  ): Promise<BookingResponseDto> {
    return this.ownerBookingService.completeBooking(
      fieldId,
      bookingId,
      ownerUserId,
    );
  }
}
