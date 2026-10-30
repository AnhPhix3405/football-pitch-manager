import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Public } from '~/components/auth/decorators/public.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiPostCommentDocs } from '../docs/post-comment.doc';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PostCommentService } from '../services/post-comment.service';

@ApiPostCommentDocs.controller()
@Controller('posts/:id/comments')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPostCommentDocs.getComments()
  async getComments(@Param('id') postId: string) {
    return this.postCommentService.getComments(postId);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPostCommentDocs.addComment()
  async addComment(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postCommentService.addComment(postId, userId, dto.content);
  }
}
