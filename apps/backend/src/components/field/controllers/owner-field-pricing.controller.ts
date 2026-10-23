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
  ApiCreateFieldPricingDoc,
  ApiDeleteFieldPricingDoc,
  ApiGetFieldPricingDoc,
  ApiOwnerFieldPricingControllerDoc,
  ApiUpdateFieldPricingDoc,
} from '../docs/owner-field-pricing.doc';
import { CreateFieldPricingDto } from '../dto/create-field-pricing.dto';
import { FieldPricingQueryDto } from '../dto/field-pricing-query.dto';
import { FieldPricingResponseDto } from '../dto/field-pricing-response.dto';
import { UpdateFieldPricingDto } from '../dto/update-field-pricing.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldPricingService } from '../services/owner-field-pricing.service';

@ApiOwnerFieldPricingControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/pricing')
export class OwnerFieldPricingController {
  constructor(private readonly pricingService: OwnerFieldPricingService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFieldPricingDoc()
  async createPricing(
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateFieldPricingDto,
  ): Promise<FieldPricingResponseDto> {
    return this.pricingService.createPricing(fieldId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldPricingDoc()
  async getPricingList(
    @Param('fieldId') fieldId: string,
    @Query() query: FieldPricingQueryDto,
  ): Promise<FieldPricingResponseDto[]> {
    return this.pricingService.getPricingList(fieldId, query);
  }

  @Patch(':pricingId')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateFieldPricingDoc()
  async updatePricing(
    @Param('fieldId') fieldId: string,
    @Param('pricingId') pricingId: string,
    @Body() dto: UpdateFieldPricingDto,
  ): Promise<FieldPricingResponseDto> {
    return this.pricingService.updatePricing(fieldId, pricingId, dto);
  }

  @Delete(':pricingId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteFieldPricingDoc()
  async deletePricing(
    @Param('fieldId') fieldId: string,
    @Param('pricingId') pricingId: string,
  ): Promise<{ success: boolean }> {
    return this.pricingService.deletePricing(fieldId, pricingId);
  }
}
