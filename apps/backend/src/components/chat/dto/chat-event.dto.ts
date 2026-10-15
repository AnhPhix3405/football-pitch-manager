import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  messageType?: string = 'text';
}

export class MarkAsDeliveredDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId!: string;
}

export class MarkAsReadDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId!: string;
}

export class EditMessageDto {
  @IsUUID()
  @IsNotEmpty()
  messageId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class DeleteMessageDto {
  @IsUUID()
  @IsNotEmpty()
  messageId!: string;
}
