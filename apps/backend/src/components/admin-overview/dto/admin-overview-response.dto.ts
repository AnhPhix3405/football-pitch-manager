import { ApiProperty } from '@nestjs/swagger';

export class AdminRoleDistributionDto {
  @ApiProperty({ example: 1180 })
  user!: number;

  @ApiProperty({ example: 68 })
  owner!: number;

  @ApiProperty({ example: 2 })
  admin!: number;
}

export class AdminUsersMetricDto {
  @ApiProperty({ example: 1250 })
  total!: number;

  @ApiProperty({ example: 84 })
  newThisMonth!: number;

  @ApiProperty({ example: 72 })
  previousMonth!: number;

  @ApiProperty({ example: 16.67 })
  growthPercent!: number;

  @ApiProperty({ type: () => AdminRoleDistributionDto })
  byRole!: AdminRoleDistributionDto;
}

export class AdminFieldsMetricDto {
  @ApiProperty({ example: 148 })
  active!: number;

  @ApiProperty({ example: 165 })
  total!: number;

  @ApiProperty({ example: 12 })
  pending!: number;

  @ApiProperty({ example: 9 })
  newThisMonth!: number;
}

export class AdminGmvMetricDto {
  @ApiProperty({ example: 248000000 })
  currentMonthGmv!: number;

  @ApiProperty({ example: 213000000 })
  previousMonthGmv!: number;

  @ApiProperty({ example: 16.43 })
  growthPercent!: number;

  @ApiProperty({ example: 185000000 })
  totalPaidRevenue!: number;
}

export class AdminQueueMetricDto {
  @ApiProperty({ example: 15 })
  totalPending!: number;

  @ApiProperty({ example: 6 })
  pendingOwnerApprovals!: number;

  @ApiProperty({ example: 7 })
  pendingFieldApprovals!: number;

  @ApiProperty({ example: 2 })
  flaggedReviews!: number;
}

export class AdminOverviewMetricsDto {
  @ApiProperty({ type: () => AdminUsersMetricDto })
  users!: AdminUsersMetricDto;

  @ApiProperty({ type: () => AdminFieldsMetricDto })
  fields!: AdminFieldsMetricDto;

  @ApiProperty({ type: () => AdminGmvMetricDto })
  gmv!: AdminGmvMetricDto;

  @ApiProperty({ type: () => AdminQueueMetricDto })
  queue!: AdminQueueMetricDto;
}

export class AdminActivityPointDto {
  @ApiProperty({ example: '2026-10-08' })
  date!: string;

  @ApiProperty({ example: 24 })
  bookingsCount!: number;

  @ApiProperty({ example: 9600000 })
  gmv!: number;

  @ApiProperty({ example: 5 })
  newUsersCount!: number;
}

export class AdminServiceHealthItemDto {
  @ApiProperty({ example: 'API Gateway' })
  name!: string;

  @ApiProperty({ enum: ['up', 'degraded', 'down'], example: 'up' })
  status!: 'up' | 'degraded' | 'down';

  @ApiProperty({ example: 100 })
  score!: number;

  @ApiProperty({ example: 2 })
  latencyMs!: number;
}

export class AdminSystemHealthDto {
  @ApiProperty({ enum: ['operational', 'degraded'], example: 'operational' })
  status!: 'operational' | 'degraded';

  @ApiProperty({ example: 86400 })
  uptimeSeconds!: number;

  @ApiProperty({ type: () => [AdminServiceHealthItemDto] })
  services!: AdminServiceHealthItemDto[];
}

export class AdminPriorityQueueItemDto {
  @ApiProperty({ example: 'd3b07384-d113-40e1-95b6-75399589d6e4' })
  id!: string;

  @ApiProperty({
    enum: ['OWNER_APPROVAL', 'FIELD_APPROVAL', 'REVIEW_REPORT'],
    example: 'OWNER_APPROVAL',
  })
  category!: 'OWNER_APPROVAL' | 'FIELD_APPROVAL' | 'REVIEW_REPORT';

  @ApiProperty({ example: 'owner_register' })
  subType!: string;

  @ApiProperty({ example: 'Sân Bóng Đá Tân Bình Sport Complex' })
  title!: string;

  @ApiProperty({ example: 'owner@example.com' })
  requesterEmail!: string;

  @ApiProperty({ example: 'pending' })
  status!: string;

  @ApiProperty({ example: '2026-11-05T10:00:00.000Z' })
  createdAt!: Date;
}

export class AdminAuditItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'APPROVE_FIELD' })
  action!: string;

  @ApiProperty({ example: 'admin@pitchmaster.vn' })
  actor!: string;

  @ApiProperty({ example: 'Sân bóng Chánh Hưng' })
  target!: string;

  @ApiProperty({ example: '2026-11-06T09:30:00.000Z' })
  timestamp!: Date;
}

export class AdminOverviewResponseDto {
  @ApiProperty({ type: () => AdminOverviewMetricsDto })
  metrics!: AdminOverviewMetricsDto;

  @ApiProperty({ type: () => [AdminActivityPointDto] })
  activityTimeline!: AdminActivityPointDto[];

  @ApiProperty({ type: () => AdminSystemHealthDto })
  systemHealth!: AdminSystemHealthDto;

  @ApiProperty({ type: () => [AdminPriorityQueueItemDto] })
  priorityQueue!: AdminPriorityQueueItemDto[];

  @ApiProperty({ type: () => [AdminAuditItemDto] })
  recentAudits!: AdminAuditItemDto[];
}
