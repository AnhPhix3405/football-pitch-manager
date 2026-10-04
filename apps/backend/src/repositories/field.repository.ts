import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldEntity } from '~/entities/field.entity';

export interface CreateFieldData {
  name: string;
  address: string;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  requireDeposit?: boolean;
  depositType?: string | null;
  depositValue?: number | null;
}

export interface UpdateFieldData {
  name?: string;
  address?: string;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  requireDeposit?: boolean;
  depositType?: string | null;
  depositValue?: number | null;
  status?: string;
}

export interface FindOwnerFieldsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface FindPublicFieldsOptions {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
}

@Injectable()
export class FieldRepository extends BaseRepository<FieldEntity> {
  constructor(
    @InjectRepository(FieldEntity)
    repository: Repository<FieldEntity>,
  ) {
    super(repository);
  }

  async createField(
    ownerId: string,
    data: CreateFieldData,
  ): Promise<FieldEntity> {
    const field = this.repository.create({
      id: randomUUID(),
      ownerId,
      name: data.name,
      address: data.address,
      district: data.district ?? null,
      lat: data.lat !== undefined && data.lat !== null ? String(data.lat) : null,
      lng: data.lng !== undefined && data.lng !== null ? String(data.lng) : null,
      description: data.description ?? null,
      status: 'pending',
      requireDeposit: data.requireDeposit ?? false,
      depositType: data.requireDeposit ? (data.depositType ?? null) : null,
      depositValue:
        data.requireDeposit && data.depositValue !== undefined && data.depositValue !== null
          ? String(data.depositValue)
          : null,
    });

    return this.repository.save(field);
  }

  async findByOwnerIdWithPagination(
    ownerId: string,
    options: FindOwnerFieldsOptions = {},
  ): Promise<{ items: FieldEntity[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('field')
      .where('field.ownerId = :ownerId', { ownerId });

    if (options.status) {
      qb.andWhere('field.status = :status', { status: options.status });
    }

    if (options.search?.trim()) {
      const sanitized = options.search.trim().replace(/[%_]/g, '\\$&');
      qb.andWhere('field.name ILIKE :search', { search: `%${sanitized}%` });
    }

    qb.orderBy('field.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<FieldEntity | null> {
    return this.repository.findOne({
      where: { id, ownerId },
    });
  }

  async findActiveFieldsWithPagination(
    options: FindPublicFieldsOptions = {},
  ): Promise<{ items: FieldEntity[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('field')
      .where('field.status = :status', { status: 'active' });

    if (options.district?.trim()) {
      qb.andWhere('field.district = :district', { district: options.district.trim() });
    }

    if (options.search?.trim()) {
      const sanitized = options.search.trim().replace(/[%_]/g, '\\$&');
      qb.andWhere('field.name ILIKE :search', { search: `%${sanitized}%` });
    }

    qb.orderBy('field.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findActiveById(id: string): Promise<FieldEntity | null> {
    return this.repository.findOne({
      where: { id, status: 'active' },
    });
  }
}
