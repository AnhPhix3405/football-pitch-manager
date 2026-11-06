import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import {
  ApiAdminOverviewControllerDoc,
  ApiGetAdminOverviewDoc,
} from '../docs/admin-overview.doc';
import { AdminOverviewQueryDto } from '../dto/admin-overview-query.dto';
import { AdminOverviewResponseDto } from '../dto/admin-overview-response.dto';
import { AdminOverviewService } from '../services/admin-overview.service';

@ApiAdminOverviewControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin/overview')
export class AdminOverviewController {
  constructor(private readonly adminOverviewService: AdminOverviewService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetAdminOverviewDoc()
  async getOverview(
    @Query() query: AdminOverviewQueryDto,
  ): Promise<AdminOverviewResponseDto> {
    return this.adminOverviewService.getOverview(query);
  }
}
