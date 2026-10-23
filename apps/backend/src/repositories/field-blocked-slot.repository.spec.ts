/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { FieldBlockedSlotRepository } from './field-blocked-slot.repository';

describe('FieldBlockedSlotRepository', () => {
  let repository: FieldBlockedSlotRepository;
  let typeormRepo: jest.Mocked<Repository<FieldBlockedSlotEntity>>;
  let qb: jest.Mocked<SelectQueryBuilder<FieldBlockedSlotEntity>>;

  beforeEach(() => {
    qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<SelectQueryBuilder<FieldBlockedSlotEntity>>;

    typeormRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldBlockedSlotEntity>>;

    repository = new FieldBlockedSlotRepository(typeormRepo);
  });

  it('builds overlap query correctly with non-strict inequalities for boundary touch', async () => {
    const mockSlots = [
      { id: 'slot-1', startTime: '08:00', endTime: '10:00' },
    ] as FieldBlockedSlotEntity[];
    qb.getMany.mockResolvedValue(mockSlots);

    const result = await repository.findOverlappingSlots(
      'court-1',
      '2026-10-24',
      '09:00',
      '11:00',
    );

    expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('slot');
    expect(qb.where).toHaveBeenCalledWith('slot.fieldCourtId = :courtId', {
      courtId: 'court-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'slot.blockedDate = :blockedDate',
      { blockedDate: '2026-10-24' },
    );
    expect(qb.andWhere).toHaveBeenCalledWith(
      'slot.startTime < :endTime AND slot.endTime > :startTime',
      { startTime: '09:00', endTime: '11:00' },
    );
    expect(result).toEqual(mockSlots);
  });

  it('finds overlapping slots across multiple courts', async () => {
    qb.getMany.mockResolvedValue([
      { id: 'slot-1' },
    ] as FieldBlockedSlotEntity[]);

    const result = await repository.findOverlappingSlotsByCourtsAndDate(
      ['court-1', 'court-2'],
      '2026-10-24',
      '09:00',
      '11:00',
    );

    expect(qb.where).toHaveBeenCalledWith(
      'slot.fieldCourtId IN (:...courtIds)',
      {
        courtIds: ['court-1', 'court-2'],
      },
    );
    expect(result).toHaveLength(1);
  });

  it('returns empty array when courtIds is empty in findOverlappingSlotsByCourtsAndDate', async () => {
    const result = await repository.findOverlappingSlotsByCourtsAndDate(
      [],
      '2026-10-24',
      '09:00',
      '11:00',
    );
    expect(result).toEqual([]);
  });
});
