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
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiUserBooking } from '../docs/user-booking.doc';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UserBookingQueryDto } from '../dto/user-booking-query.dto';
import { UserBookingService } from '../services/user-booking.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiUserBooking.apply()
export class UserBookingController {
  constructor(private readonly userBookingService: UserBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiUserBooking.createBooking()
  async createBooking(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.userBookingService.createBooking(userId, dto);
  }

  @Get('me')
  @ApiUserBooking.getMyBookings()
  async getMyBookings(
    @CurrentUser('id') userId: string,
    @Query() query: UserBookingQueryDto,
  ) {
    return this.userBookingService.getMyBookings(userId, query);
  }

  @Get(':id')
  @ApiUserBooking.getBookingDetail()
  async getBookingDetail(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    return this.userBookingService.getBookingDetail(userId, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiUserBooking.cancelMyBooking()
  async cancelMyBooking(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return this.userBookingService.cancelMyBooking(userId, id, dto);
  }
}
