import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminAuditItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  actor!: string;

  @ApiProperty({ default: 'admin' })
  actorRole!: string;

  @ApiProperty()
  target!: string;

  @ApiPropertyOptional({ nullable: true })
  targetType!: string | null;

  @ApiPropertyOptional({ nullable: true })
  targetId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  ip!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  timestamp!: string;

  @ApiPropertyOptional({ nullable: true })
  details!: Record<string, unknown> | null;
}

export class AdminAuditListResponseDto {
  @ApiProperty({ type: [AdminAuditItemDto] })
  items!: AdminAuditItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty({ type: [String] })
  availableCategories!: string[];
}

export class ModerationMetricsDto {
  @ApiProperty()
  totalReports!: number;

  @ApiProperty()
  pendingReports!: number;

  @ApiProperty()
  resolvedReports!: number;

  @ApiProperty()
  processedWithin24hRate!: number;
}

export class ModerationReportItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['post', 'review', 'user'] })
  type!: 'post' | 'review' | 'user';

  @ApiProperty()
  targetId!: string;

  @ApiProperty()
  author!: string;

  @ApiPropertyOptional({ nullable: true })
  authorId!: string | null;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  reportedAt!: string;

  @ApiProperty({ enum: ['pending', 'resolved'] })
  status!: 'pending' | 'resolved';

  @ApiPropertyOptional({ nullable: true })
  actionTaken!: string | null;

  @ApiPropertyOptional({ nullable: true })
  resolvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  moderator!: string | null;
}

export class AdminModerationReportsResponseDto {
  @ApiProperty({ type: ModerationMetricsDto })
  metrics!: ModerationMetricsDto;

  @ApiProperty({ type: [ModerationReportItemDto] })
  items!: ModerationReportItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class SystemNodeMetricsDto {
  @ApiPropertyOptional()
  uptimeSeconds?: number;

  @ApiPropertyOptional()
  heapUsedMb?: number;

  @ApiPropertyOptional()
  heapTotalMb?: number;

  @ApiPropertyOptional()
  activeConnections?: number;

  @ApiPropertyOptional()
  databaseSizeBytes?: number;

  @ApiPropertyOptional()
  maxConnections?: number;

  @ApiPropertyOptional()
  connectedClients?: number;

  @ApiPropertyOptional()
  usedMemoryMb?: number;

  @ApiPropertyOptional()
  serviceStatus?: string;
}

export class SystemNodeStatusDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['OPERATIONAL', 'DEGRADED', 'OUTAGE'] })
  status!: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';

  @ApiProperty()
  healthPercent!: number;

  @ApiProperty()
  latencyMs!: number;

  @ApiProperty()
  detail!: string;

  @ApiPropertyOptional({ type: SystemNodeMetricsDto })
  metrics?: SystemNodeMetricsDto;
}

export class AdminSystemStatusResponseDto {
  @ApiProperty({ enum: ['OPERATIONAL', 'DEGRADED', 'OUTAGE'] })
  overallStatus!: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';

  @ApiProperty()
  timestamp!: string;

  @ApiProperty({ type: [SystemNodeStatusDto] })
  nodes!: SystemNodeStatusDto[];
}
