import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { OwnerPaymentSettingsDto } from '../dto/owner-payment-settings.dto';
import { OwnerPaymentSettingsService } from '../services/owner-payment-settings.service';

@Controller()
export class OwnerPaymentSettingsController {
  constructor(private readonly settings: OwnerPaymentSettingsService) {}

  @Get('payments/fields/:fieldId/options')
  getPublic(@Param('fieldId', ParseUUIDPipe) fieldId: string) {
    return this.settings.getPublic(fieldId);
  }

  @Get('owner/fields/:fieldId/payment-settings')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
  @Roles('owner')
  @AllowedStatuses('active')
  getOwner(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.settings.getOwner(fieldId, ownerId);
  }

  @Put('owner/fields/:fieldId/payment-settings')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
  @Roles('owner')
  @AllowedStatuses('active')
  update(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: OwnerPaymentSettingsDto,
  ) {
    return this.settings.update(fieldId, ownerId, dto);
  }
}
