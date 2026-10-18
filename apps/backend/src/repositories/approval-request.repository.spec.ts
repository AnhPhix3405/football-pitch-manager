/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { ApprovalRequestRepository } from './approval-request.repository';

describe('ApprovalRequestRepository', () => {
  let repository: ApprovalRequestRepository;
  let typeOrmRepo: jest.Mocked<Repository<ApprovalRequestEntity>>;
  let qb: jest.Mocked<SelectQueryBuilder<ApprovalRequestEntity>>;

  beforeEach(() => {
    qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getOne: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<SelectQueryBuilder<ApprovalRequestEntity>>;

    typeOrmRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ApprovalRequestEntity>>;

    repository = new ApprovalRequestRepository(typeOrmRepo);
  });

  describe('findFieldApprovals', () => {
    it('queries requests filtering by field approval types and status', async () => {
      const mockResult: [ApprovalRequestEntity[], number] = [
        [
          {
            id: 'req-1',
            type: 'field_create',
            status: 'pending',
          } as ApprovalRequestEntity,
        ],
        1,
      ];
      qb.getManyAndCount.mockResolvedValue(mockResult);

      const res = await repository.findFieldApprovals({
        type: 'field_create',
        status: 'pending',
        page: 1,
        limit: 10,
      });

      expect(typeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('request');
      expect(qb.where).toHaveBeenCalledWith('request.type IN (:...types)', {
        types: ['field_create'],
      });
      expect(qb.andWhere).toHaveBeenCalledWith('request.status = :status', {
        status: 'pending',
      });
      expect(res.total).toBe(1);
      expect(res.items).toEqual(mockResult[0]);
    });
  });

  describe('findPendingByTargetIdAndTypes', () => {
    it('queries repository for pending request with matching targetId and types', async () => {
      const mockRequest = {
        id: 'req-1',
        targetId: 'field-1',
        status: 'pending',
      } as ApprovalRequestEntity;
      qb.getOne.mockResolvedValue(mockRequest);

      const res = await repository.findPendingByTargetIdAndTypes('field-1', [
        'field_create',
        'field_update',
      ]);

      expect(typeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('request');
      expect(qb.where).toHaveBeenCalledWith('request.targetId = :targetId', {
        targetId: 'field-1',
      });
      expect(res).toBe(mockRequest);
    });
  });

  describe('findFieldApprovalById', () => {
    it('queries single field approval request by ID with relations', async () => {
      const mockRequest = {
        id: 'req-1',
        type: 'field_create',
      } as ApprovalRequestEntity;
      qb.getOne.mockResolvedValue(mockRequest);

      const res = await repository.findFieldApprovalById('req-1');

      expect(typeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('request');
      expect(qb.where).toHaveBeenCalledWith('request.id = :id', {
        id: 'req-1',
      });
      expect(res).toBe(mockRequest);
    });
  });
});
