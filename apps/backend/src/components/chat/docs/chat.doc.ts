import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ConversationResponseDto,
  MessageItemResponseDto,
} from '../dto/conversation-response.dto';

export function ApiChatControllerDoc() {
  return applyDecorators(ApiTags('Chat'));
}

export function ApiGetConversationsDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy danh sách các cuộc trò chuyện của người dùng hiện tại',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách cuộc trò chuyện thành công',
      type: [ConversationResponseDto],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiCreateConversationDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Bắt đầu hoặc lấy cuộc trò chuyện trực tiếp / sân bóng / bài đăng',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Tạo hoặc lấy hội thoại thành công',
      type: ConversationResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu đầu vào không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiGetMessagesDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy lịch sử tin nhắn của cuộc trò chuyện',
    }),
    ApiParam({
      name: 'id',
      description: 'ID của cuộc trò chuyện (UUID)',
      type: String,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Số lượng tin nhắn tối đa cần lấy (mặc định 20, tối đa 100)',
    }),
    ApiQuery({
      name: 'before',
      required: false,
      type: String,
      description: 'Mốc thời gian ISO (UTC) để lấy các tin nhắn cũ hơn',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách tin nhắn thành công',
      type: [MessageItemResponseDto],
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Không có quyền truy cập vào cuộc trò chuyện này',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiDeleteConversationDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Xóa cuộc trò chuyện (Xóa 1 phía nếu đối phương chưa xóa, xóa hoàn toàn nếu cả 2 phía cùng xóa)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID của cuộc trò chuyện (UUID)',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Xóa cuộc trò chuyện thành công',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          hardDeleted: { type: 'boolean', example: false },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Không có quyền xóa cuộc trò chuyện này',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
  );
}
