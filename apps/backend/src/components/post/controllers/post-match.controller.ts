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
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiPostMatchDocs } from '../docs/post-match.doc';
import { PostMatchService } from '../services/post-match.service';

@ApiPostMatchDocs.controller()
@UseGuards(JwtAuthGuard, AccountStatusGuard)
@Controller('posts/:id/matches')
export class PostMatchController {
  constructor(private readonly postMatchService: PostMatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPostMatchDocs.applyMatch()
  async applyMatch(
    @Param('id') postId: string,
    @CurrentUser('id') applicantId: string,
  ) {
    return this.postMatchService.applyMatch(postId, applicantId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPostMatchDocs.getPostMatches()
  async getPostMatches(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postMatchService.getPostMatches(postId, userId);
  }

  @Patch(':matchId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiPostMatchDocs.acceptMatch()
  async acceptMatch(
    @Param('id') postId: string,
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postMatchService.acceptMatch(postId, matchId, userId);
  }

  @Patch(':matchId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiPostMatchDocs.rejectMatch()
  async rejectMatch(
    @Param('id') postId: string,
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postMatchService.rejectMatch(postId, matchId, userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPostMatchDocs.cancelMatch()
  async cancelMatch(
    @Param('id') postId: string,
    @CurrentUser('id') applicantId: string,
  ): Promise<void> {
    await this.postMatchService.cancelMatch(postId, applicantId);
  }
}
