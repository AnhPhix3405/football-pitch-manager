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
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Public } from '~/components/auth/decorators/public.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiPostDocs } from '../docs/post.doc';
import { CreatePostDto } from '../dto/create-post.dto';
import { QueryPostDto } from '../dto/query-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostService } from '../services/post.service';

@ApiPostDocs.controller()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPostDocs.getPublicPosts()
  async getPublicPosts(@Query() query: QueryPostDto) {
    return this.postService.getPublicPosts(query);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiPostDocs.getMyPosts()
  async getMyPosts(
    @CurrentUser('id') userId: string,
    @Query() query: QueryPostDto,
  ) {
    return this.postService.getMyPosts(userId, query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPostDocs.getPostDetail()
  async getPostDetail(@Param('id') id: string) {
    return this.postService.getPostDetail(id);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPostDocs.createPost()
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPost(userId, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPostDocs.updatePost()
  async updatePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPostDocs.deletePost()
  async deletePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.postService.deletePost(userId, id);
  }
}
