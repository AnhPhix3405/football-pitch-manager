import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiMatchSuggestionResponseDto } from '../dto/ai-match-suggestion-response.dto';
import { AiUsageResponseDto } from '../dto/ai-usage-response.dto';

export const ApiAiDocs = {
  controller: () => applyDecorators(ApiTags('AI Assistant')),

  matchmakingSuggestion: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary:
          'Gợi ý người chơi ghép trận phù hợp nhất bằng AI (Rate Limited)',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Kết quả phân tích độ tương thích và ứng viên phù hợp',
        type: AiMatchSuggestionResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Đã vượt quá hạn mức yêu cầu AI cho gói hiện tại',
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bài đăng',
      }),
    ),

  getUsage: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Xem hạn mức và số lượt yêu cầu AI đã sử dụng trong ngày',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Thông tin hạn mức và lượt sử dụng AI',
        type: AiUsageResponseDto,
      }),
    ),
};
