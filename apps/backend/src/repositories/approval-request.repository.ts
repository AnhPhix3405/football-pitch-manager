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
}
