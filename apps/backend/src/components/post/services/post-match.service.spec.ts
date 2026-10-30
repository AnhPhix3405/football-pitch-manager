/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ChatGateway } from '~/components/chat/gateways/chat.gateway';
import { ChatService } from '~/components/chat/services/chat.service';
import { NotificationService } from '~/components/notification/services/notification.service';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostEntity } from '~/entities/post.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { POST_MATCH_STATUS, POST_STATUS } from '../constants/post.constant';
import { PostMatchService } from './post-match.service';

describe('PostMatchService', () => {
  let service: PostMatchService;
  let dataSource: jest.Mocked<DataSource>;
  let postRepository: jest.Mocked<PostRepository>;
  let postMatchRepository: jest.Mocked<PostMatchRepository>;
  let chatService: jest.Mocked<ChatService>;
  let chatGateway: jest.Mocked<ChatGateway>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    postRepository = {
      findById: jest.fn(),
      save: jest.fn((e) => Promise.resolve(e as PostEntity)),
    } as unknown as jest.Mocked<PostRepository>;

    postMatchRepository = {
      findByPostId: jest.fn(),
      findByPostAndApplicant: jest.fn(),
      findById: jest.fn(),
      create: jest.fn((e) => e as PostMatchEntity),
      save: jest.fn((e) => Promise.resolve(e as PostMatchEntity)),
    } as unknown as jest.Mocked<PostMatchRepository>;

    chatService = {
      createMatchConversation: jest.fn().mockResolvedValue({
        conversation: { id: 'conv-1' },
        message: { id: 'msg-1' },
      }),
    } as unknown as jest.Mocked<ChatService>;

    chatGateway = {
      emitToConversation: jest.fn(),
      emitToUsers: jest.fn(),
    } as unknown as jest.Mocked<ChatGateway>;

    notificationService = {
      createAndSend: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<NotificationService>;

    service = new PostMatchService(
      dataSource,
      postRepository,
      postMatchRepository,
      chatService,
      chatGateway,
      notificationService,
    );
  });

  describe('applyMatch', () => {
    it('allows a user to apply to an open post', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        title: 'Football 7v7',
        status: POST_STATUS.OPEN,
        deletedAt: null,
      } as PostEntity);

      postMatchRepository.findByPostAndApplicant.mockResolvedValue(null);

      const result = await service.applyMatch('p-1', 'applicant-1');
      expect(result.status).toBe(POST_MATCH_STATUS.PENDING);
      expect(postMatchRepository.save).toHaveBeenCalled();
      expect(notificationService.createAndSend).toHaveBeenCalled();
    });

    it('rejects if applying to own post', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'applicant-1',
        status: POST_STATUS.OPEN,
        deletedAt: null,
      } as PostEntity);

      await expect(service.applyMatch('p-1', 'applicant-1')).rejects.toThrow(
        ApplicationException,
      );
    });

    it('rejects if post is not open', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        status: POST_STATUS.CLOSED,
        deletedAt: null,
      } as PostEntity);

      await expect(service.applyMatch('p-1', 'applicant-1')).rejects.toThrow(
        ApplicationException,
      );
    });

    it('rejects duplicate pending application', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        status: POST_STATUS.OPEN,
        deletedAt: null,
      } as PostEntity);

      postMatchRepository.findByPostAndApplicant.mockResolvedValue({
        id: 'm-1',
        status: POST_MATCH_STATUS.PENDING,
      } as PostMatchEntity);

      await expect(service.applyMatch('p-1', 'applicant-1')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('getPostMatches', () => {
    it('returns all matches if requester is the post owner', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        deletedAt: null,
      } as PostEntity);

      const matches = [{ id: 'm-1' }, { id: 'm-2' }] as PostMatchEntity[];
      postMatchRepository.findByPostId.mockResolvedValue(matches);

      const result = await service.getPostMatches('p-1', 'host-1');
      expect(result).toHaveLength(2);
    });

    it('returns only own match if requester is not the post owner', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        deletedAt: null,
      } as PostEntity);

      const myMatch = { id: 'm-1', applicantId: 'user-2' } as PostMatchEntity;
      postMatchRepository.findByPostAndApplicant.mockResolvedValue(myMatch);

      const result = await service.getPostMatches('p-1', 'user-2');
      expect(result).toEqual([myMatch]);
    });
  });

  describe('cancelMatch', () => {
    it('cancels pending match successfully', async () => {
      const match = {
        id: 'm-1',
        status: POST_MATCH_STATUS.PENDING,
      } as PostMatchEntity;
      postMatchRepository.findByPostAndApplicant.mockResolvedValue(match);

      await service.cancelMatch('p-1', 'user-1');
      expect(match.status).toBe(POST_MATCH_STATUS.CANCELLED);
      expect(postMatchRepository.save).toHaveBeenCalledWith(match);
    });

    it('rejects cancellation if match was already accepted', async () => {
      const match = {
        id: 'm-1',
        status: POST_MATCH_STATUS.ACCEPTED,
      } as PostMatchEntity;
      postMatchRepository.findByPostAndApplicant.mockResolvedValue(match);

      await expect(service.cancelMatch('p-1', 'user-1')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('acceptMatch (Task 4)', () => {
    it('accepts applicant, increments players and links conversation in transaction', async () => {
      const post = {
        id: 'p-1',
        userId: 'host-1',
        title: 'Football 7v7',
        status: POST_STATUS.OPEN,
        currentPlayers: 0,
        maxPlayers: 2,
        deletedAt: null,
      } as PostEntity;

      const match = {
        id: 'm-1',
        postId: 'p-1',
        applicantId: 'applicant-1',
        status: POST_MATCH_STATUS.PENDING,
      } as PostMatchEntity;

      const mockManager: any = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === PostEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue({
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(post),
              }),
            };
          }
          if (entity === PostMatchEntity) {
            return {
              findOne: jest.fn().mockResolvedValue(match),
            };
          }
        }),
        save: jest
          .fn()
          .mockImplementation((_type, entity) =>
            Promise.resolve(entity || _type),
          ),
      };

      dataSource.transaction.mockImplementation(
        (cb: (m: any) => Promise<any>) => cb(mockManager),
      );

      const result = await service.acceptMatch('p-1', 'm-1', 'host-1');
      expect(result.status).toBe(POST_MATCH_STATUS.ACCEPTED);
      expect(post.currentPlayers).toBe(1);
      expect(post.status).toBe(POST_STATUS.OPEN);
      expect(result.conversationId).toBe('conv-1');
      expect(chatGateway.emitToConversation).toHaveBeenCalled();
    });

    it('automatically transitions post to matched when maxPlayers reached', async () => {
      const post = {
        id: 'p-1',
        userId: 'host-1',
        title: 'Football 7v7',
        status: POST_STATUS.OPEN,
        currentPlayers: 1,
        maxPlayers: 2,
        deletedAt: null,
      } as PostEntity;

      const match = {
        id: 'm-1',
        postId: 'p-1',
        applicantId: 'applicant-1',
        status: POST_MATCH_STATUS.PENDING,
      } as PostMatchEntity;

      const mockManager: any = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === PostEntity) {
            return {
              createQueryBuilder: jest.fn().mockReturnValue({
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(post),
              }),
            };
          }
          if (entity === PostMatchEntity) {
            return {
              findOne: jest.fn().mockResolvedValue(match),
            };
          }
        }),
        save: jest
          .fn()
          .mockImplementation((_type, entity) =>
            Promise.resolve(entity || _type),
          ),
      };

      dataSource.transaction.mockImplementation(
        (cb: (m: any) => Promise<any>) => cb(mockManager),
      );

      await service.acceptMatch('p-1', 'm-1', 'host-1');
      expect(post.currentPlayers).toBe(2);
      expect(post.status).toBe(POST_STATUS.MATCHED);
    });

    it('rejects if maxPlayers already reached', async () => {
      const post = {
        id: 'p-1',
        userId: 'host-1',
        status: POST_STATUS.OPEN,
        currentPlayers: 2,
        maxPlayers: 2,
        deletedAt: null,
      } as PostEntity;

      const mockManager: any = {
        getRepository: jest.fn().mockReturnValue({
          createQueryBuilder: jest.fn().mockReturnValue({
            setLock: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(post),
          }),
        }),
      };

      dataSource.transaction.mockImplementation(
        (cb: (m: any) => Promise<any>) => cb(mockManager),
      );

      await expect(service.acceptMatch('p-1', 'm-1', 'host-1')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('rejectMatch', () => {
    it('updates match status to rejected', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        userId: 'host-1',
        deletedAt: null,
      } as PostEntity);

      const match = {
        id: 'm-1',
        postId: 'p-1',
        status: POST_MATCH_STATUS.PENDING,
      } as PostMatchEntity;
      postMatchRepository.findById.mockResolvedValue(match);

      const result = await service.rejectMatch('p-1', 'm-1', 'host-1');
      expect(result.status).toBe(POST_MATCH_STATUS.REJECTED);
      expect(postMatchRepository.save).toHaveBeenCalledWith(match);
    });
  });
});
