import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { OwnerDashboardService } from '../services/owner-dashboard.service';

@ApiTags('Owner Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@AllowedStatuses('active')
@Roles('owner')
@Controller('owner/dashboard')
export class OwnerDashboardController {
  constructor(private readonly dashboard: OwnerDashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get metrics and recent bookings for the current owner',
  })
  getStats(@CurrentUser('id') ownerId: string) {
    return this.dashboard.getStats(ownerId);
  }
}
