import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { CheckFieldOwnership } from '../decorators/check-field-ownership.decorator';
import {
  ApiGetCourtTimelineDoc,
  ApiOwnerCourtTimelineControllerDoc,
  ApiValidateCourtAssignmentDoc,
} from '../docs/owner-court-timeline.doc';
import { CourtTimelineQueryDto } from '../dto/court-timeline-query.dto';
import { CourtTimelineResponseDto } from '../dto/court-timeline-response.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { FieldAvailabilityService } from '../services/field-availability.service';

@ApiOwnerCourtTimelineControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/courts')
export class OwnerCourtTimelineController {
  constructor(private readonly availabilityService: FieldAvailabilityService) {}

  @Get('timeline')
  @HttpCode(HttpStatus.OK)
  @ApiGetCourtTimelineDoc()
  async getCourtTimeline(
    @Param('fieldId') fieldId: string,
    @Query() query: CourtTimelineQueryDto,
  ): Promise<CourtTimelineResponseDto> {
    return this.availabilityService.getCourtTimeline(fieldId, query);
  }

  @Get(':courtId/check-assignment')
  @HttpCode(HttpStatus.OK)
  @ApiValidateCourtAssignmentDoc()
  async validateCourtAssignment(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
    @Query('courtType') courtType: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<{ valid: boolean }> {
    const valid = await this.availabilityService.validateCourtAssignment(
      courtId,
      fieldId,
      courtType,
      date,
      startTime,
      endTime,
    );
    return { valid };
  }
}
