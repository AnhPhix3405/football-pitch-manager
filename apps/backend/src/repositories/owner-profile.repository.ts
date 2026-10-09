import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';

export interface UpsertOwnerProfileData {
  businessName?: string | null;
  businessLicense?: string | null;
  bankAccount?: string | null;
}

@Injectable()
export class OwnerProfileRepository extends BaseRepository<OwnerProfileEntity> {
  constructor(
    @InjectRepository(OwnerProfileEntity)
    repository: Repository<OwnerProfileEntity>,
  ) {
    super(repository);
  }

  findByUserId(userId: string): Promise<OwnerProfileEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  findById(id: string): Promise<OwnerProfileEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async findByIds(ids: string[]): Promise<OwnerProfileEntity[]> {
    if (!ids.length) {
      return [];
    }
    return this.repository.find({
      where: { id: In(ids) },
      relations: { user: true },
    });
  }

  async upsertByUserId(
    userId: string,
    data: UpsertOwnerProfileData,
  ): Promise<OwnerProfileEntity> {
    const existing = await this.repository.findOne({ where: { userId } });

    if (!existing) {
      const created = this.repository.create({
        id: randomUUID(),
        userId,
        businessName: data.businessName ?? null,
        businessLicense: data.businessLicense ?? null,
        bankAccount: data.bankAccount ?? null,
        verifiedAt: null,
      });
      await this.repository.save(created);
      return (await this.findByUserId(userId)) ?? created;
    }

    if (data.businessName !== undefined) {
      existing.businessName = data.businessName;
    }
    if (data.businessLicense !== undefined) {
      existing.businessLicense = data.businessLicense;
    }
    if (data.bankAccount !== undefined) {
      existing.bankAccount = data.bankAccount;
    }

    await this.repository.save(existing);
    return (await this.findByUserId(userId)) ?? existing;
  }
}
