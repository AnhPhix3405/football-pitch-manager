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
} from '../docs/field-availability.doc';
import { CheckAvailabilityQueryDto } from '../dto/check-availability-query.dto';
import { FieldAvailabilityResponseDto } from '../dto/field-availability-response.dto';
import { FieldAvailabilityService } from '../services/field-availability.service';

@ApiFieldAvailabilityControllerDoc()
@Controller('fields/:fieldId/availability')
export class FieldAvailabilityController {
  constructor(private readonly availabilityService: FieldAvailabilityService) {}

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
