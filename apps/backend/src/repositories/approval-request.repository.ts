import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';

export interface CreateApprovalRequestData {
  type: string;
  targetId: string;
  requestedBy: string;
  status?: string;
  note?: string | null;
}

export interface FindOwnerApprovalsOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedApprovalRequests {
  items: ApprovalRequestEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ApprovalRequestRepository extends BaseRepository<ApprovalRequestEntity> {
  constructor(
    @InjectRepository(ApprovalRequestEntity)
    repository: Repository<ApprovalRequestEntity>,
  ) {
    super(repository);
  }

  findPendingByRequesterAndType(
    requestedBy: string,
    type: string,
  ): Promise<ApprovalRequestEntity | null> {
    return this.repository.findOne({
      where: { requestedBy, type, status: 'pending' },
      order: { createdAt: 'DESC' },
    });
  }

  findLatestByRequesterAndType(
    requestedBy: string,
    type: string,
  ): Promise<ApprovalRequestEntity | null> {
    return this.repository.findOne({
      where: { requestedBy, type },
      order: { createdAt: 'DESC' },
    });
  }

  async createRequest(
    data: CreateApprovalRequestData,
    manager?: EntityManager,
  ): Promise<ApprovalRequestEntity> {
    const repo = manager
      ? manager.getRepository(ApprovalRequestEntity)
      : this.repository;

    const request = repo.create({
      id: randomUUID(),
      type: data.type,
      targetId: data.targetId,
      requestedBy: data.requestedBy,
      status: data.status ?? 'pending',
      note: data.note ?? null,
      reviewedBy: null,
      reviewedAt: null,
    });

    return repo.save(request);
  }

  async findOwnerRegistrations(
    options: FindOwnerApprovalsOptions,
  ): Promise<PaginatedApprovalRequests> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.reviewer', 'reviewer')
      .where('request.type = :type', { type: 'owner_register' });

    if (options.status && options.status !== 'all') {
      qb.andWhere('request.status = :status', { status: options.status });
    }

    qb.orderBy('request.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  findOwnerRegistrationById(id: string): Promise<ApprovalRequestEntity | null> {
    return this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.reviewer', 'reviewer')
      .where('request.id = :id', { id })
      .andWhere('request.type = :type', { type: 'owner_register' })
      .getOne();
  }
}
