import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { PostEntity } from '~/entities/post.entity';
import { PostRepository } from '~/repositories/post.repository';
import { POST_STATUS } from '../constants/post.constant';
import { CreatePostDto } from '../dto/create-post.dto';
import { QueryPostDto } from '../dto/query-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) { }

  async getPublicPosts(query: QueryPostDto) {
    return this.postRepository.findPublicPosts({
      page: query.page,
      limit: query.limit,
      search: query.search,
      skillLevel: query.skillLevel,
      playDate: query.playDate,
    });
  }

  async getMyPosts(userId: string, query: QueryPostDto) {
    return this.postRepository.findMyPosts(userId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
    });
  }

  async getPostDetail(id: string): Promise<PostEntity> {
    const post = await this.postRepository.findPostDetailById(id);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }
    return post;
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<PostEntity> {
    const today = dayjs().format('YYYY-MM-DD');
    if (dayjs(dto.playDate).isBefore(today)) {
      throw new ApplicationException({
        code: 'INVALID_PLAY_DATE',
        messageKey: 'error.invalidPlayDate',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.endTime && dto.startTime >= dto.endTime) {
      throw new ApplicationException({
        code: 'INVALID_POST_TIME',
        messageKey: 'error.invalidPostTime',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const post = this.postRepository.create({
      id: randomUUID(),
      userId,
      title: dto.title.trim(),
      content: dto.content?.trim() || null,
      playDate: dto.playDate,
      startTime: dto.startTime,
      endTime: dto.endTime || null,
      skillLevelRequired: dto.skillLevelRequired?.trim() || null,
      maxPlayers: dto.maxPlayers ?? 14,
      currentPlayers: 0,
      version: 1,
      lat: dto.lat ? String(dto.lat) : null,
      lng: dto.lng ? String(dto.lng) : null,
      status: POST_STATUS.OPEN,
      imageUrl: dto.imageUrl?.trim() || null,
      deletedAt: null,
    });

    return this.postRepository.save(post);
  }

  async updatePost(
    userId: string,
    id: string,
    dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findById(id);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (post.userId !== userId) {
      throw new ApplicationException({
        code: 'FORBIDDEN_POST_ACTION',
        messageKey: 'error.forbiddenPostAction',
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (dto.playDate) {
      const today = dayjs().format('YYYY-MM-DD');
      if (dayjs(dto.playDate).isBefore(today)) {
        throw new ApplicationException({
          code: 'INVALID_PLAY_DATE',
          messageKey: 'error.invalidPlayDate',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      post.playDate = dto.playDate;
    }

    const effectiveStartTime = dto.startTime || post.startTime;
    const effectiveEndTime =
      dto.endTime !== undefined ? dto.endTime : post.endTime;
    if (
      effectiveEndTime &&
      effectiveStartTime &&
      effectiveStartTime >= effectiveEndTime
    ) {
      throw new ApplicationException({
        code: 'INVALID_POST_TIME',
        messageKey: 'error.invalidPostTime',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.title !== undefined) post.title = dto.title.trim();
    if (dto.content !== undefined) post.content = dto.content?.trim() || null;
    if (dto.startTime !== undefined) post.startTime = dto.startTime;
    if (dto.endTime !== undefined) post.endTime = dto.endTime || null;
    if (dto.skillLevelRequired !== undefined)
      post.skillLevelRequired = dto.skillLevelRequired?.trim() || null;
    if (dto.maxPlayers !== undefined) post.maxPlayers = dto.maxPlayers;
    if (dto.lat !== undefined) post.lat = dto.lat ? String(dto.lat) : null;
    if (dto.lng !== undefined) post.lng = dto.lng ? String(dto.lng) : null;
    if (dto.imageUrl !== undefined)
      post.imageUrl = dto.imageUrl?.trim() || null;
    if (dto.status !== undefined) post.status = dto.status;

    return this.postRepository.save(post);
  }

  async deletePost(userId: string, id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (post.userId !== userId) {
      throw new ApplicationException({
        code: 'FORBIDDEN_POST_ACTION',
        messageKey: 'error.forbiddenPostAction',
        status: HttpStatus.FORBIDDEN,
      });
    }

    post.deletedAt = new Date();
    post.status = POST_STATUS.CANCELLED;
    await this.postRepository.save(post);
  }
}
