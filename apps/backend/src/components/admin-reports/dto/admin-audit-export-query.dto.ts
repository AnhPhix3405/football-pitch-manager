import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { AdminAuditQueryDto } from './admin-audit-query.dto';

export const EXPORT_FORMATS = ['json', 'csv'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export class AdminAuditExportQueryDto extends AdminAuditQueryDto {
  @ApiPropertyOptional({ enum: EXPORT_FORMATS, default: 'json' })
  @IsOptional()
  @IsIn(EXPORT_FORMATS)
  format?: ExportFormat = 'json';
}
