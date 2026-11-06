import { ApiProperty } from '@nestjs/swagger';

export class AdminPaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class AdminUserItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ enum: ['user', 'owner', 'admin'] })
  role!: 'user' | 'owner' | 'admin';

  @ApiProperty()
  status!: string;

  @ApiProperty()
  reportsCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class AdminUsersSummaryDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  activeUsers!: number;

  @ApiProperty()
  suspendedUsers!: number;

  @ApiProperty()
  flaggedUsers!: number;
}

export class AdminUsersListResponseDto {
  @ApiProperty({ type: [AdminUserItemDto] })
  items!: AdminUserItemDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;

  @ApiProperty({ type: AdminUsersSummaryDto })
  summary!: AdminUsersSummaryDto;
}

export class AdminUserStatsDto {
  @ApiProperty()
  bookingsCount!: number;

  @ApiProperty()
  fieldsCount!: number;

  @ApiProperty()
  postsCount!: number;
}

export class AdminUserDetailResponseDto extends AdminUserItemDto {
  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  skillLevel!: string | null;

  @ApiProperty({ type: [String] })
  preferredPositions!: string[];

  @ApiProperty()
  reliabilityScore!: number;

  @ApiProperty({ type: AdminUserStatsDto })
  stats!: AdminUserStatsDto;

  @ApiProperty()
  updatedAt!: string;
}

export class AdminPostItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  authorName!: string;

  @ApiProperty()
  authorEmail!: string;

  @ApiProperty({ nullable: true })
  fieldId!: string | null;

  @ApiProperty({ nullable: true })
  fieldName!: string | null;

  @ApiProperty()
  playDate!: string;

  @ApiProperty()
  startTime!: string;

  @ApiProperty()
  endTime!: string;

  @ApiProperty({ nullable: true })
  skillLevelRequired!: string | null;

  @ApiProperty({ nullable: true })
  maxPlayers!: number | null;

  @ApiProperty()
  currentPlayers!: number;

  @ApiProperty()
  commentsCount!: number;

  @ApiProperty({ enum: ['open', 'matched', 'closed'] })
  status!: 'open' | 'matched' | 'closed';

  @ApiProperty()
  createdAt!: string;
}

export class AdminPostsSummaryDto {
  @ApiProperty()
  totalPosts!: number;

  @ApiProperty()
  openPosts!: number;

  @ApiProperty()
  matchedPosts!: number;

  @ApiProperty()
  closedPosts!: number;
}

export class AdminPostsListResponseDto {
  @ApiProperty({ type: [AdminPostItemDto] })
  items!: AdminPostItemDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;

  @ApiProperty({ type: AdminPostsSummaryDto })
  summary!: AdminPostsSummaryDto;
}

export class AdminDeletePostResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: 'closed';

  @ApiProperty()
  deletedAt!: string;
}

export class AdminReviewItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['field', 'user'] })
  reviewType!: 'field' | 'user';

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  comment!: string;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  authorName!: string;

  @ApiProperty()
  authorEmail!: string;

  @ApiProperty()
  targetId!: string;

  @ApiProperty()
  targetName!: string;

  @ApiProperty()
  isFlagged!: boolean;

  @ApiProperty({ nullable: true })
  flagReason!: string | null;

  @ApiProperty({ enum: ['pending', 'resolved'] })
  moderationStatus!: 'pending' | 'resolved';

  @ApiProperty()
  createdAt!: string;
}

export class AdminReviewsSummaryDto {
  @ApiProperty()
  totalFlagged!: number;

  @ApiProperty()
  pendingCount!: number;

  @ApiProperty()
  resolvedCount!: number;
}

export class AdminReviewsListResponseDto {
  @ApiProperty({ type: [AdminReviewItemDto] })
  items!: AdminReviewItemDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;

  @ApiProperty({ type: AdminReviewsSummaryDto })
  summary!: AdminReviewsSummaryDto;
}
