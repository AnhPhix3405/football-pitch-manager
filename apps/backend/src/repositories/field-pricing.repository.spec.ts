/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';
import { FieldPricingRepository } from './field-pricing.repository';

describe('FieldPricingRepository', () => {
  let repository: FieldPricingRepository;
  let typeOrmRepository: jest.Mocked<Repository<FieldPricingEntity>>;

  beforeEach(() => {
    typeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldPricingEntity>>;

    repository = new FieldPricingRepository(typeOrmRepository);
  });

  it('finds pricing rules by field with queryBuilder', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'p-1', price: '200000' }]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findByField('f-1', {
      courtType: '5',
      dayType: 'weekday',
    });

    expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalledWith(
      'pricing',
    );
    expect(qb.where).toHaveBeenCalledWith('pricing.fieldId = :fieldId', {
      fieldId: 'f-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.courtType = :courtType', {
      courtType: '5',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.dayType = :dayType', {
      dayType: 'weekday',
    });
    expect(result).toHaveLength(1);
  });

  it('finds pricing by id and field id', async () => {
    const mockPricing = { id: 'p-1', fieldId: 'f-1' } as FieldPricingEntity;
    typeOrmRepository.findOne.mockResolvedValue(mockPricing);

    const result = await repository.findByIdAndFieldId('p-1', 'f-1');
    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'p-1', fieldId: 'f-1' },
    });
    expect(result).toEqual(mockPricing);
  });

  it('checks for overlapping slots excluding self', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'p-2' }]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findOverlappingSlots(
      'f-1',
      '5',
      'weekday',
      '08:00',
      '10:00',
      'p-current',
    );

    expect(qb.where).toHaveBeenCalledWith('pricing.fieldId = :fieldId', {
      fieldId: 'f-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.courtType = :courtType', {
      courtType: '5',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.dayType = :dayType', {
      dayType: 'weekday',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.startTime < :endTime', {
      endTime: '10:00',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.endTime > :startTime', {
      startTime: '08:00',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('pricing.id != :excludeId', {
      excludeId: 'p-current',
    });
    expect(result).toEqual([{ id: 'p-2' }]);
  });
});
