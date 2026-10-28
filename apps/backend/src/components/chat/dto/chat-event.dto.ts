import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MESSAGE_TYPE } from '../constants/chat.constant';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  messageType?: string = MESSAGE_TYPE.TEXT;
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
