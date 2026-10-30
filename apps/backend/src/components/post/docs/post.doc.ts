import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostResponseDto } from '../dto/post-response.dto';

export const ApiPostDocs = {
  controller: () => applyDecorators(ApiTags('Posts')),

  getPublicPosts: () =>
    applyDecorators(
      ApiOperation({ summary: 'Lấy danh sách bài đăng tìm đối công khai' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách bài đăng công khai phân trang',
      }),
    ),

  getMyPosts: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Lấy danh sách bài đăng của user hiện tại' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách bài đăng của chính mình',
      }),
    ),

  getPostDetail: () =>
    applyDecorators(
      ApiOperation({ summary: 'Xem chi tiết bài đăng' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Chi tiết bài đăng',
        type: PostResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bài đăng',
      }),
    ),

  createPost: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Tạo bài đăng tìm đối mới' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Bài đăng được tạo thành công',
        type: PostResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dữ liệu không hợp lệ',
      }),
    ),

  updatePost: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Chỉnh sửa bài đăng' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Cập nhật bài đăng thành công',
        type: PostResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Không có quyền chỉnh sửa bài viết của người khác',
      }),
    ),

  deletePost: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Xóa mềm bài đăng' }),
      ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Xóa bài đăng thành công',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Không có quyền xóa bài viết của người khác',
      }),
    ),
};
