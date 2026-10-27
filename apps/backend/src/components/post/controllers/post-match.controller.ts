import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { PostMatchService } from '../services/post-match.service';

@ApiTags('Post Matches (Matchmaking)')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
@ApiBearerAuth()
@Controller('posts/:id/matches')
export class PostMatchController {
  constructor(private readonly postMatchService: PostMatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gửi yêu cầu bắt đối cho bài đăng' })
  async applyMatch(
    @Param('id') postId: string,
    @CurrentUser('id') applicantId: string,
  ) {
    return this.postMatchService.applyMatch(postId, applicantId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xem danh sách các đội/ứng viên xin bắt đối' })
  async getPostMatches(@Param('id') postId: string) {
    return this.postMatchService.getPostMatches(postId);
  }

  @Patch(':matchId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chấp nhận đội bắt đối (Chuyển bài sang matched)' })
  async acceptMatch(
    @Param('id') postId: string,
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postMatchService.acceptMatch(postId, matchId, userId);
  }

  @Patch(':matchId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Từ chối đội bắt đối' })
  async rejectMatch(
    @Param('id') postId: string,
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postMatchService.rejectMatch(postId, matchId, userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Người dùng rút lại yêu cầu bắt đối' })
  async cancelMatch(
    @Param('id') postId: string,
    @CurrentUser('id') applicantId: string,
  ) {
    return this.postMatchService.cancelMatch(postId, applicantId);
  }
}
