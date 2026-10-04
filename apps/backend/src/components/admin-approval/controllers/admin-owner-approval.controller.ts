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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { AdminApproveOwnerDto } from '../dto/admin-approve-owner.dto';
import { AdminOwnerApprovalDetailResponseDto } from '../dto/admin-owner-approval-detail-response.dto';
import { AdminOwnerApprovalListResponseDto } from '../dto/admin-owner-approval-list-response.dto';
import { AdminOwnerApprovalQueryDto } from '../dto/admin-owner-approval-query.dto';
import { AdminRejectOwnerDto } from '../dto/admin-reject-owner.dto';
import { AdminOwnerApprovalService } from '../services/admin-owner-approval.service';

@ApiTags('Admin Owner Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin/owner-approvals')
export class AdminOwnerApprovalController {
  constructor(
    private readonly adminOwnerApprovalService: AdminOwnerApprovalService,
  ) {}

  @ApiOperation({
    summary: 'Danh sách các yêu cầu đăng ký chủ sân kèm bộ lọc và phân trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách yêu cầu đăng ký chủ sân thành công',
    type: AdminOwnerApprovalListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Chỉ quản trị viên mới có quyền truy cập',
  })
  @Get('')
  @HttpCode(HttpStatus.OK)
  async getApprovals(
    @Query() query: AdminOwnerApprovalQueryDto,
  ): Promise<AdminOwnerApprovalListResponseDto> {
    return this.adminOwnerApprovalService.getOwnerApprovals(query);
  }

  @ApiOperation({
    summary: 'Chi tiết yêu cầu đăng ký chủ sân và hồ sơ liên quan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID yêu cầu phê duyệt',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy chi tiết yêu cầu phê duyệt thành công',
    type: AdminOwnerApprovalDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy yêu cầu phê duyệt',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getApprovalDetail(
    @Param('id') id: string,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    return this.adminOwnerApprovalService.getOwnerApprovalDetail(id);
  }

  @ApiOperation({
    summary: 'Phê duyệt hồ sơ đăng ký chủ sân và nâng quyền tài khoản thành Owner',
  })
  @ApiParam({
    name: 'id',
    description: 'ID yêu cầu phê duyệt',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phê duyệt thành công',
    type: AdminOwnerApprovalDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Yêu cầu không ở trạng thái pending hoặc đã được xử lý trước đó',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy yêu cầu phê duyệt',
  })
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
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

  @ApiOperation({
    summary: 'Từ chối hồ sơ đăng ký chủ sân và lưu lý do từ chối',
  })
  @ApiParam({
    name: 'id',
    description: 'ID yêu cầu phê duyệt',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Từ chối yêu cầu thành công',
    type: AdminOwnerApprovalDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Yêu cầu không ở trạng thái pending hoặc thiếu lý do từ chối',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy yêu cầu phê duyệt',
  })
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
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
