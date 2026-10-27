import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LastMessageDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  content!: string | null;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class ConversationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  online!: boolean;

  @ApiProperty()
  unreadCount!: number;

  @ApiProperty({ enum: ['field', 'team'] })
  kind!: 'field' | 'team';

  @ApiPropertyOptional({ nullable: true })
  relatedFieldId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  relatedPostId!: string | null;

  @ApiPropertyOptional({ type: LastMessageDto, nullable: true })
  lastMessage!: LastMessageDto | null;

  @ApiProperty()
  updatedAt!: Date;
}

export class MessageItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  conversationId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiPropertyOptional({ nullable: true })
  content!: string | null;

  @ApiProperty()
  messageType!: string;

  @ApiProperty()
  isEdited!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
