import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { CheckFieldOwnership } from '../decorators/check-field-ownership.decorator';
import {
  ApiGetFieldOpeningHoursDoc,
  ApiOwnerFieldOpeningHourControllerDoc,
  ApiUpsertFieldOpeningHoursDoc,
} from '../docs/owner-field-opening-hour.doc';
import { FieldOpeningHourResponseDto } from '../dto/field-opening-hour-response.dto';
import { UpsertFieldOpeningHoursDto } from '../dto/upsert-field-opening-hours.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldOpeningHourService } from '../services/owner-field-opening-hour.service';

@ApiOwnerFieldOpeningHourControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/opening-hours')
export class OwnerFieldOpeningHourController {
  constructor(
    private readonly openingHourService: OwnerFieldOpeningHourService,
  ) {}

  @Put('')
  @HttpCode(HttpStatus.OK)
  @ApiUpsertFieldOpeningHoursDoc()
  async upsertOpeningHours(
    @Param('fieldId') fieldId: string,
    @Body() dto: UpsertFieldOpeningHoursDto,
  ): Promise<FieldOpeningHourResponseDto[]> {
    return this.openingHourService.upsertOpeningHours(fieldId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldOpeningHoursDoc()
  async getOpeningHours(
    @Param('fieldId') fieldId: string,
  ): Promise<FieldOpeningHourResponseDto[]> {
    return this.openingHourService.getOpeningHours(fieldId);
  }
}
