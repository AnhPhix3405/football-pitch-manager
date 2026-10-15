import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Public } from '~/components/auth/decorators/public.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { CreatePostDto } from '../dto/create-post.dto';
import { QueryPostDto } from '../dto/query-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostService } from '../services/post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách bài đăng tìm đối công khai' })
  async getPublicPosts(@Query() query: QueryPostDto) {
    return this.postService.getPublicPosts(query);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách bài đăng của user hiện tại' })
  async getMyPosts(
    @CurrentUser('id') userId: string,
    @Query() query: QueryPostDto,
  ) {
    return this.postService.getMyPosts(userId, query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xem chi tiết bài đăng' })
  async getPostDetail(@Param('id') id: string) {
    return this.postService.getPostDetail(id);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo bài đăng tìm đối mới' })
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPost(userId, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chỉnh sửa bài đăng' })
  async updatePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đóng / Xóa bài đăng' })
  async deletePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.postService.deletePost(userId, id);
  }
}
