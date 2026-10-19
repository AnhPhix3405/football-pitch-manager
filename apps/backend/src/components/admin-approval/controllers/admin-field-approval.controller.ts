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
  ApiAdminFieldApprovalControllerDoc,
  ApiApproveFieldDoc,
  ApiGetFieldApprovalDetailDoc,
  ApiGetFieldApprovalsDoc,
  ApiRejectFieldDoc,
} from '../docs/admin-field-approval.doc';
import { AdminApproveFieldDto } from '../dto/admin-approve-field.dto';
import { AdminFieldApprovalDetailResponseDto } from '../dto/admin-field-approval-detail-response.dto';
import { AdminFieldApprovalListResponseDto } from '../dto/admin-field-approval-list-response.dto';
import { AdminFieldApprovalQueryDto } from '../dto/admin-field-approval-query.dto';
import { AdminRejectFieldDto } from '../dto/admin-reject-field.dto';
import { AdminFieldApprovalService } from '../services/admin-field-approval.service';

@ApiAdminFieldApprovalControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin/field-approvals')
export class AdminFieldApprovalController {
  constructor(
    private readonly adminFieldApprovalService: AdminFieldApprovalService,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldApprovalsDoc()
  async getApprovals(
    @Query() query: AdminFieldApprovalQueryDto,
  ): Promise<AdminFieldApprovalListResponseDto> {
    return this.adminFieldApprovalService.getFieldApprovals(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldApprovalDetailDoc()
  async getApprovalDetail(
    @Param('id') id: string,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    return this.adminFieldApprovalService.getFieldApprovalDetail(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiApproveFieldDoc()
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: AdminApproveFieldDto,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    return this.adminFieldApprovalService.approveFieldRequest(
      id,
      adminUserId,
      dto,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiRejectFieldDoc()
  async reject(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: AdminRejectFieldDto,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    return this.adminFieldApprovalService.rejectFieldRequest(
      id,
      adminUserId,
      dto,
    );
  }
}
