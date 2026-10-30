import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { TransactionEntity } from '~/entities/transaction.entity';

@Injectable()
export class TransactionRepository extends BaseRepository<TransactionEntity> {
  constructor(
    @InjectRepository(TransactionEntity)
    repository: Repository<TransactionEntity>,
  ) {
    super(repository);
  }

  async createTransaction(
    data: DeepPartial<TransactionEntity>,
  ): Promise<TransactionEntity> {
    const entity = this.repository.create({
      id: randomUUID(),
      ...data,
    });
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByRefIdAndType(
    refId: string,
    type: string,
  ): Promise<TransactionEntity | null> {
    return this.repository.findOne({ where: { refId, type } });
  }

  async findByGatewayRef(
    gatewayRef: string,
  ): Promise<TransactionEntity | null> {
    return this.repository.findOne({ where: { gatewayRef } });
  }

  async updateStatus(
    id: string,
    status: string,
    gatewayRef?: string | null,
  ): Promise<TransactionEntity> {
    const tx = await this.repository.findOne({ where: { id } });
    if (!tx) {
      throw new Error(`Transaction ${id} not found`);
    }
    tx.status = status;
    if (gatewayRef !== undefined) {
      tx.gatewayRef = gatewayRef;
    }
    return this.repository.save(tx);
  }
}
