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
  ApiCreateFieldServiceDoc,
  ApiDeleteFieldServiceDoc,
  ApiGetFieldServicesDoc,
  ApiOwnerFieldServiceControllerDoc,
  ApiUpdateFieldServiceDoc,
} from '../docs/owner-field-service.doc';
import { CreateFieldServiceDto } from '../dto/create-field-service.dto';
import { FieldServiceResponseDto } from '../dto/field-service-response.dto';
import { UpdateFieldServiceDto } from '../dto/update-field-service.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldServiceService } from '../services/owner-field-service.service';

@ApiOwnerFieldServiceControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/services')
export class OwnerFieldServiceController {
  constructor(private readonly serviceService: OwnerFieldServiceService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFieldServiceDoc()
  async createService(
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateFieldServiceDto,
  ): Promise<FieldServiceResponseDto> {
    return this.serviceService.createService(fieldId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldServicesDoc()
  async getServices(
    @Param('fieldId') fieldId: string,
    @Query('isActive') isActive?: string,
  ): Promise<FieldServiceResponseDto[]> {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.serviceService.getServices(fieldId, activeFilter);
  }

  @Patch(':serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateFieldServiceDoc()
  async updateService(
    @Param('fieldId') fieldId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateFieldServiceDto,
  ): Promise<FieldServiceResponseDto> {
    return this.serviceService.updateService(fieldId, serviceId, dto);
  }

  @Delete(':serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteFieldServiceDoc()
  async deleteService(
    @Param('fieldId') fieldId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<FieldServiceResponseDto> {
    return this.serviceService.deleteService(fieldId, serviceId);
  }
}
