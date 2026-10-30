import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostCommentResponseDto } from '../dto/post-comment-response.dto';

export const ApiPostCommentDocs = {
  controller: () => applyDecorators(ApiTags('Post Comments')),

  getComments: () =>
    applyDecorators(
      ApiOperation({ summary: 'Lấy danh sách bình luận của bài đăng' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách bình luận sắp xếp theo thời gian',
        type: [PostCommentResponseDto],
      }),
    ),

  addComment: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Bình luận vào bài đăng' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Bình luận được gửi thành công',
        type: PostCommentResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bài đăng',
      }),
    ),
};
