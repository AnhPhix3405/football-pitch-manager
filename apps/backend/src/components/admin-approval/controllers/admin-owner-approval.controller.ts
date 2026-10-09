import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import {
  ApiAdminOwnerApprovalControllerDoc,
  ApiApproveOwnerRegistrationDoc,
  ApiGetApprovalDetailDoc,
  ApiGetApprovalsDoc,
  ApiRejectOwnerRegistrationDoc,
} from '../docs/admin-owner-approval.doc';
import { AdminApproveOwnerDto } from '../dto/admin-approve-owner.dto';
import { AdminOwnerApprovalDetailResponseDto } from '../dto/admin-owner-approval-detail-response.dto';
import { AdminOwnerApprovalListResponseDto } from '../dto/admin-owner-approval-list-response.dto';
import { AdminOwnerApprovalQueryDto } from '../dto/admin-owner-approval-query.dto';
import { AdminRejectOwnerDto } from '../dto/admin-reject-owner.dto';
import { AdminOwnerApprovalService } from '../services/admin-owner-approval.service';

@ApiAdminOwnerApprovalControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin/owner-approvals')
export class AdminOwnerApprovalController {
  constructor(
    private readonly adminOwnerApprovalService: AdminOwnerApprovalService,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetApprovalsDoc()
  async getApprovals(
    @Query() query: AdminOwnerApprovalQueryDto,
  ): Promise<AdminOwnerApprovalListResponseDto> {
    return this.adminOwnerApprovalService.getOwnerApprovals(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiGetApprovalDetailDoc()
  async getApprovalDetail(
    @Param('id') id: string,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    return this.adminOwnerApprovalService.getOwnerApprovalDetail(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiApproveOwnerRegistrationDoc()
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: AdminApproveOwnerDto,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    return this.adminOwnerApprovalService.approveOwnerRegistration(
      id,
      adminUserId,
      dto,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiRejectOwnerRegistrationDoc()
  async reject(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: AdminRejectOwnerDto,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    return this.adminOwnerApprovalService.rejectOwnerRegistration(
      id,
      adminUserId,
      dto,
    );
  }
}
