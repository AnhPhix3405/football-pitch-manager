import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AllowedStatuses } from '../../auth/decorators/account-status.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  ApiAdminReportsControllerDoc,
  ApiExportAuditLogsDoc,
  ApiGetAuditLogDetailDoc,
  ApiGetAuditLogsDoc,
  ApiGetModerationReportDetailDoc,
  ApiGetModerationReportsDoc,
  ApiGetSystemStatusDoc,
} from '../docs/admin-reports.doc';
import { AdminAuditExportQueryDto } from '../dto/admin-audit-export-query.dto';
import { AdminAuditQueryDto } from '../dto/admin-audit-query.dto';
import { AdminModerationReportsQueryDto } from '../dto/admin-moderation-reports-query.dto';
import {
  AdminAuditItemDto,
  AdminAuditListResponseDto,
  AdminModerationReportsResponseDto,
  AdminSystemStatusResponseDto,
  ModerationReportItemDto,
} from '../dto/admin-reports-response.dto';
import { AdminReportsService } from '../services/admin-reports.service';

@ApiAdminReportsControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('admin')
@AllowedStatuses('active')
@Controller('admin')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  @ApiGetAuditLogsDoc()
  async getAuditLogs(
    @Query() query: AdminAuditQueryDto,
  ): Promise<AdminAuditListResponseDto> {
    return this.adminReportsService.getAuditLogs(query);
  }

  @Get('audit-logs/export')
  @HttpCode(HttpStatus.OK)
  @ApiExportAuditLogsDoc()
  async exportAuditLogs(
    @Query() query: AdminAuditExportQueryDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<string> {
    const result = await this.adminReportsService.exportAuditLogs(query);
    res.header('Content-Type', result.contentType);
    res.header(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    return result.data;
  }

  @Get('audit-logs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiGetAuditLogDetailDoc()
  async getAuditLogById(@Param('id') id: string): Promise<AdminAuditItemDto> {
    return this.adminReportsService.getAuditLogById(id);
  }

  @Get('reports/moderation')
  @HttpCode(HttpStatus.OK)
  @ApiGetModerationReportsDoc()
  async getModerationReports(
    @Query() query: AdminModerationReportsQueryDto,
  ): Promise<AdminModerationReportsResponseDto> {
    return this.adminReportsService.getModerationReports(query);
  }

  @Get('reports/moderation/:id')
  @HttpCode(HttpStatus.OK)
  @ApiGetModerationReportDetailDoc()
  async getModerationReportById(
    @Param('id') id: string,
  ): Promise<ModerationReportItemDto> {
    return this.adminReportsService.getModerationReportById(id);
  }

  @Get('reports/system-status')
  @HttpCode(HttpStatus.OK)
  @ApiGetSystemStatusDoc()
  async getSystemStatus(): Promise<AdminSystemStatusResponseDto> {
    return this.adminReportsService.getSystemStatus();
  }
}
