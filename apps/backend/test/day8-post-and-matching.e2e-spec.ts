/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApplication } from '../src/common/configure-application';
import { AccountStatusGuard } from '../src/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '../src/components/auth/guards/jwt-auth.guard';
import { PostCommentController } from '../src/components/post/controllers/post-comment.controller';
import { PostMatchController } from '../src/components/post/controllers/post-match.controller';
import { PostController } from '../src/components/post/controllers/post.controller';
import { PostCommentService } from '../src/components/post/services/post-comment.service';
import { PostMatchService } from '../src/components/post/services/post-match.service';
import { PostService } from '../src/components/post/services/post.service';

describe('Day 8 Post & Matchmaking API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockPostService = {
    getPublicPosts: jest.fn(),
    getMyPosts: jest.fn(),
    getPostDetail: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  const mockPostCommentService = {
    getComments: jest.fn(),
    addComment: jest.fn(),
  };

  const mockPostMatchService = {
    applyMatch: jest.fn(),
    getPostMatches: jest.fn(),
    acceptMatch: jest.fn(),
    rejectMatch: jest.fn(),
    cancelMatch: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostController, PostMatchController, PostCommentController],
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: PostCommentService, useValue: mockPostCommentService },
        { provide: PostMatchService, useValue: mockPostMatchService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'user-host-1',
            email: 'host@test.com',
            role: 'user',
          };
          return true;
        },
      })
      .overrideGuard(AccountStatusGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Post Management Flows', () => {
    it('GET /posts - retrieves public posts with pagination', async () => {
      mockPostService.getPublicPosts.mockResolvedValue({
        items: [{ id: 'post-1', title: 'Match 7v7' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const res = await app.inject({
        method: 'GET',
        url: '/posts?page=1&limit=10',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.total).toBe(1);
      expect(json.data.items[0].title).toBe('Match 7v7');
    });

    it('POST /posts - creates a new matchmaking post', async () => {
      mockPostService.createPost.mockResolvedValue({
        id: 'post-1',
        title: 'Match 7v7',
        playDate: '2026-10-31',
        startTime: '18:00',
        status: 'open',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/posts',
        payload: {
          title: 'Match 7v7',
          playDate: '2026-10-31',
          startTime: '18:00',
          maxPlayers: 14,
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe('post-1');
    });

    it('GET /posts/:id - views post detail', async () => {
      mockPostService.getPostDetail.mockResolvedValue({
        id: 'post-1',
        title: 'Match 7v7',
        status: 'open',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/posts/post-1',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe('post-1');
    });

    it('PATCH /posts/:id - updates post details', async () => {
      mockPostService.updatePost.mockResolvedValue({
        id: 'post-1',
        title: 'Updated Match 7v7',
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/posts/post-1',
        payload: { title: 'Updated Match 7v7' },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.title).toBe('Updated Match 7v7');
    });

    it('DELETE /posts/:id - soft deletes post', async () => {
      mockPostService.deletePost.mockResolvedValue();

      const res = await app.inject({
        method: 'DELETE',
        url: '/posts/post-1',
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe('Post Comment Flows', () => {
    it('GET /posts/:id/comments - retrieves post comments', async () => {
      mockPostCommentService.getComments.mockResolvedValue([
        { id: 'c-1', content: 'Giao lưu nhé bạn' },
      ]);

      const res = await app.inject({
        method: 'GET',
        url: '/posts/post-1/comments',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].content).toBe('Giao lưu nhé bạn');
    });

    it('POST /posts/:id/comments - adds a comment', async () => {
      mockPostCommentService.addComment.mockResolvedValue({
        id: 'c-1',
        postId: 'post-1',
        content: 'Cho mình xin 1 slot',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/posts/post-1/comments',
        payload: { content: 'Cho mình xin 1 slot' },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe('c-1');
    });
  });

  describe('Matchmaking Application & Acceptance Flows', () => {
    it('POST /posts/:id/matches - applies to join post', async () => {
      mockPostMatchService.applyMatch.mockResolvedValue({
        id: 'match-1',
        postId: 'post-1',
        applicantId: 'user-host-1',
        status: 'pending',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/posts/post-1/matches',
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe('match-1');
      expect(json.data.status).toBe('pending');
    });

    it('GET /posts/:id/matches - views applicant list', async () => {
      mockPostMatchService.getPostMatches.mockResolvedValue([
        { id: 'match-1', applicantId: 'applicant-1', status: 'pending' },
      ]);

      const res = await app.inject({
        method: 'GET',
        url: '/posts/post-1/matches',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);
    });

    it('PATCH /posts/:id/matches/:matchId/accept - host accepts applicant', async () => {
      mockPostMatchService.acceptMatch.mockResolvedValue({
        id: 'match-1',
        status: 'accepted',
        conversationId: 'conv-123',
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/posts/post-1/matches/match-1/accept',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.status).toBe('accepted');
      expect(json.data.conversationId).toBe('conv-123');
    });

    it('PATCH /posts/:id/matches/:matchId/reject - host rejects applicant', async () => {
      mockPostMatchService.rejectMatch.mockResolvedValue({
        id: 'match-1',
        status: 'rejected',
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/posts/post-1/matches/match-1/reject',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.status).toBe('rejected');
    });

    it('DELETE /posts/:id/matches/me - applicant withdraws application', async () => {
      mockPostMatchService.cancelMatch.mockResolvedValue();

      const res = await app.inject({
        method: 'DELETE',
        url: '/posts/post-1/matches/me',
      });

      expect(res.statusCode).toBe(204);
    });
  });
});
