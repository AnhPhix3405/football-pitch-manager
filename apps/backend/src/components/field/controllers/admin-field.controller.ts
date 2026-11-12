import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { AdminFieldDetailResponseDto } from '../dto/admin-field-detail-response.dto';
import { AdminFieldKpiResponseDto } from '../dto/admin-field-kpi-response.dto';
import {
  AdminFieldItemDto,
  AdminFieldListResponseDto,
} from '../dto/admin-field-list-response.dto';
import { AdminFieldQueryDto } from '../dto/admin-field-query.dto';
import { UpdateAdminFieldStatusDto } from '../dto/update-admin-field-status.dto';
import { AdminFieldService } from '../services/admin-field.service';

@ApiTags('Admin Fields Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin/fields')
export class AdminFieldController {
  constructor(private readonly adminFieldService: AdminFieldService) {}

  @Get('kpi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy các chỉ số KPI vận hành sân bóng hệ thống' })
  @ApiResponse({ status: 200, type: AdminFieldKpiResponseDto })
  async getKpi(): Promise<AdminFieldKpiResponseDto> {
    return this.adminFieldService.getKpi();
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Lấy danh sách sân bóng toàn hệ thống có tìm kiếm, lọc và phân trang cho Admin',
  })
  @ApiResponse({ status: 200, type: AdminFieldListResponseDto })
  async getFields(
    @Query() query: AdminFieldQueryDto,
  ): Promise<AdminFieldListResponseDto> {
    return this.adminFieldService.getFields(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xem chi tiết thông tin hồ sơ sân bóng cho Admin' })
  @ApiResponse({ status: 200, type: AdminFieldDetailResponseDto })
  async getFieldDetail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminFieldDetailResponseDto> {
    return this.adminFieldService.getFieldDetail(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cập nhật trạng thái sân bóng (Khóa hoặc Kích hoạt lại sân; tự động cascade vô hiệu hóa sân con nếu khóa)',
  })
  @ApiResponse({ status: 200, type: AdminFieldItemDto })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminFieldStatusDto,
  ): Promise<AdminFieldItemDto> {
    return this.adminFieldService.updateStatus(id, dto);
  }
}
