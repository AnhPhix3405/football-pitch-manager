import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  ApiCreateFieldCourtDoc,
  ApiDeleteFieldCourtDoc,
  ApiGetFieldCourtDetailDoc,
  ApiGetFieldCourtsDoc,
  ApiOwnerFieldCourtControllerDoc,
  ApiUpdateFieldCourtDoc,
} from '../docs/owner-field-court.doc';
import { CreateFieldCourtDto } from '../dto/create-field-court.dto';
import { FieldCourtResponseDto } from '../dto/field-court-response.dto';
import { UpdateFieldCourtDto } from '../dto/update-field-court.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldCourtService } from '../services/owner-field-court.service';

@ApiOwnerFieldCourtControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/courts')
export class OwnerFieldCourtController {
  constructor(private readonly courtService: OwnerFieldCourtService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFieldCourtDoc()
  async createCourt(
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateFieldCourtDto,
  ): Promise<FieldCourtResponseDto> {
    return this.courtService.createCourt(fieldId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldCourtsDoc()
  async getCourts(
    @Param('fieldId') fieldId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<FieldCourtResponseDto[]> {
    return this.courtService.getCourts(fieldId, { type, status });
  }

  @Get(':courtId')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldCourtDetailDoc()
  async getCourtDetail(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
  ): Promise<FieldCourtResponseDto> {
    return this.courtService.getCourtDetail(fieldId, courtId);
  }

  @Patch(':courtId')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateFieldCourtDoc()
  async updateCourt(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
    @Body() dto: UpdateFieldCourtDto,
  ): Promise<FieldCourtResponseDto> {
    return this.courtService.updateCourt(fieldId, courtId, dto);
  }

  @Delete(':courtId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteFieldCourtDoc()
  async deleteCourt(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
  ): Promise<FieldCourtResponseDto> {
    return this.courtService.deleteCourt(fieldId, courtId);
  }
}
