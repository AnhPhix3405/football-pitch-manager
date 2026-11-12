import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from '~/components/auth/decorators/public.decorator';
import {
  ApiCheckAvailabilityDoc,
  ApiFieldAvailabilityControllerDoc,
  ApiGetAvailableSlotsDoc,
} from '../docs/field-availability.doc';
import { AvailableSlotsQueryDto } from '../dto/available-slots-query.dto';
import { AvailableSlotsResponseDto } from '../dto/available-slots-response.dto';
import { CheckAvailabilityQueryDto } from '../dto/check-availability-query.dto';
import { FieldAvailabilityResponseDto } from '../dto/field-availability-response.dto';
import { FieldAvailableSlotsService } from '../services/field-available-slots.service';
import { FieldAvailabilityService } from '../services/field-availability.service';

@ApiFieldAvailabilityControllerDoc()
@Controller('fields/:fieldId/availability')
export class FieldAvailabilityController {
  constructor(
    private readonly availabilityService: FieldAvailabilityService,
    private readonly availableSlotsService: FieldAvailableSlotsService,
  ) {}

  @Public()
  @Get('slots')
  @HttpCode(HttpStatus.OK)
  @ApiGetAvailableSlotsDoc()
  async getAvailableSlots(
    @Param('fieldId') fieldId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    return this.availableSlotsService.getAvailableSlots(fieldId, query);
  }

  @Public()
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiCheckAvailabilityDoc()
  async checkAvailability(
    @Param('fieldId') fieldId: string,
    @Query() query: CheckAvailabilityQueryDto,
  ): Promise<FieldAvailabilityResponseDto> {
    return this.availabilityService.checkCourtTypeAvailability(fieldId, query);
  }
}
