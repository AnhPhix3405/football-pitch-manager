import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PostEntity } from '~/entities/post.entity';
import { PostRepository } from '~/repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { QueryPostDto } from '../dto/query-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

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
    if (!post) {
      throw new NotFoundException(
        'Không tìm thấy bài đăng hoặc bài đã bị xóa.',
      );
    }
    return post;
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<PostEntity> {
    if (dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Giờ kết thúc phải sau giờ bắt đầu.');
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
      maxPlayers: dto.maxPlayers || 14,
      lat: dto.lat ? String(dto.lat) : null,
      lng: dto.lng ? String(dto.lng) : null,
      status: 'open',
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
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bài đăng này.',
      );
    }

    if (dto.title !== undefined) post.title = dto.title.trim();
    if (dto.content !== undefined) post.content = dto.content?.trim() || null;
    if (dto.playDate !== undefined) post.playDate = dto.playDate;
    if (dto.startTime !== undefined) post.startTime = dto.startTime;
    if (dto.endTime !== undefined) post.endTime = dto.endTime || null;
    if (dto.skillLevelRequired !== undefined)
      post.skillLevelRequired = dto.skillLevelRequired?.trim() || null;
    if (dto.maxPlayers !== undefined) post.maxPlayers = dto.maxPlayers;
    if (dto.lat !== undefined) post.lat = dto.lat ? String(dto.lat) : null;
    if (dto.lng !== undefined) post.lng = dto.lng ? String(dto.lng) : null;
    if (dto.status !== undefined) post.status = dto.status;

    return this.postRepository.save(post);
  }

  async deletePost(userId: string, id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này.');
    }

    post.deletedAt = new Date();
    post.status = 'closed';
    await this.postRepository.save(post);
  }
}
