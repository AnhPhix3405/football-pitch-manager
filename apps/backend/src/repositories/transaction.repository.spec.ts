/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { TransactionEntity } from '~/entities/transaction.entity';
import { TransactionRepository } from './transaction.repository';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let typeormRepo: jest.Mocked<Repository<TransactionEntity>>;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<TransactionEntity>>;

    repository = new TransactionRepository(typeormRepo);
  });

  it('creates and saves a transaction', async () => {
    const data = {
      userId: 'user-1',
      type: 'booking_deposit',
      refId: 'booking-1',
      amount: '100000.00',
      status: 'pending',
      gateway: 'cash',
    };
    const entity = { id: 'tx-1', ...data } as TransactionEntity;

    typeormRepo.create.mockReturnValue(entity);
    typeormRepo.save.mockResolvedValue(entity);

    const result = await repository.createTransaction(data);
    expect(result).toEqual(entity);
    expect(typeormRepo.create).toHaveBeenCalledWith(data);
    expect(typeormRepo.save).toHaveBeenCalledWith(entity);
  });

  it('finds transaction by refId and type', async () => {
    const entity = { id: 'tx-1', refId: 'booking-1', type: 'booking_deposit' } as TransactionEntity;
    typeormRepo.findOne.mockResolvedValue(entity);

    const result = await repository.findByRefIdAndType('booking-1', 'booking_deposit');
    expect(result).toEqual(entity);
    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { refId: 'booking-1', type: 'booking_deposit' },
    });
  });

  it('finds transaction by gatewayRef', async () => {
    const entity = { id: 'tx-1', gatewayRef: 'VNP123456' } as TransactionEntity;
    typeormRepo.findOne.mockResolvedValue(entity);

    const result = await repository.findByGatewayRef('VNP123456');
    expect(result).toEqual(entity);
    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { gatewayRef: 'VNP123456' },
    });
  });

  it('updates status and optional gatewayRef', async () => {
    const entity = { id: 'tx-1', status: 'pending' } as TransactionEntity;
    typeormRepo.findOne.mockResolvedValue(entity);
    typeormRepo.save.mockImplementation(async (item) => item as TransactionEntity);

    const result = await repository.updateStatus('tx-1', 'success', 'VNP999');
    expect(result.status).toBe('success');
    expect(result.gatewayRef).toBe('VNP999');
  });
});
