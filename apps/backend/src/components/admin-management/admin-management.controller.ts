import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowedStatuses } from '../auth/decorators/account-status.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountStatusGuard } from '../auth/guards/account-status.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminManagementService } from './admin-management.service';
import {
  AdminDeletePostResponseDto,
  AdminPostsListResponseDto,
  AdminReviewsListResponseDto,
  AdminUserDetailResponseDto,
  AdminUserItemDto,
  AdminUsersListResponseDto,
} from './dto/admin-management-response.dto';
import { AdminPostsQueryDto } from './dto/admin-posts-query.dto';
import { AdminReviewsQueryDto } from './dto/admin-reviews-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Admin Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin')
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService,
  ) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách người dùng toàn hệ thống cho Admin' })
  async getUsers(
    @Query() query: AdminUsersQueryDto,
  ): Promise<AdminUsersListResponseDto> {
    return this.adminManagementService.getUsers(query);
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ và thống kê của người dùng' })
  async getUserDetail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminUserDetailResponseDto> {
    return this.adminManagementService.getUserDetail(id);
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khóa hoặc mở khóa tài khoản người dùng' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('id') currentAdminId: string,
  ): Promise<AdminUserItemDto> {
    return this.adminManagementService.updateUserStatus(
      id,
      dto,
      currentAdminId,
    );
  }

  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách bài đăng cộng đồng cho Admin' })
  async getPosts(
    @Query() query: AdminPostsQueryDto,
  ): Promise<AdminPostsListResponseDto> {
    return this.adminManagementService.getPosts(query);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gỡ / đóng bài đăng vi phạm (Admin)' })
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') currentAdminId: string,
  ): Promise<AdminDeletePostResponseDto> {
    return this.adminManagementService.deletePost(id, currentAdminId);
  }

  @Get('reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Danh sách đánh giá bị báo cáo / đã xử lý (Field & User Reviews)',
  })
  async getReviews(
    @Query() query: AdminReviewsQueryDto,
  ): Promise<AdminReviewsListResponseDto> {
    return this.adminManagementService.getReviews(query);
  }
}
