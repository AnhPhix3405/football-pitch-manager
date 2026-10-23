/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldCourtRepository } from './field-court.repository';

describe('FieldCourtRepository', () => {
  let repository: FieldCourtRepository;
  let typeormRepo: jest.Mocked<Repository<FieldCourtEntity>>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldCourtEntity>>;

    repository = new FieldCourtRepository(typeormRepo);
  });

  it('finds courts by field ID with optional filters', async () => {
    const mockCourts = [
      { id: 'court-1', fieldId: 'field-1', type: '5', status: 'active' },
    ] as FieldCourtEntity[];
    typeormRepo.find.mockResolvedValue(mockCourts);

    const result = await repository.findByFieldId('field-1', {
      type: '5',
      status: 'active',
    });

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { fieldId: 'field-1', type: '5', status: 'active' },
      order: { createdAt: 'ASC' },
    });
    expect(result).toEqual(mockCourts);
  });

  it('finds court by field ID and name', async () => {
    const mockCourt = {
      id: 'court-1',
      fieldId: 'field-1',
      name: 'Court A',
    } as FieldCourtEntity;
    typeormRepo.findOne.mockResolvedValue(mockCourt);

    const result = await repository.findByFieldAndName('field-1', 'Court A');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { fieldId: 'field-1', name: 'Court A' },
    });
    expect(result).toEqual(mockCourt);
  });

  it('finds court by ID and field ID', async () => {
    const mockCourt = { id: 'court-1', fieldId: 'field-1' } as FieldCourtEntity;
    typeormRepo.findOne.mockResolvedValue(mockCourt);

    const result = await repository.findByIdAndFieldId('court-1', 'field-1');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'court-1', fieldId: 'field-1' },
    });
    expect(result).toEqual(mockCourt);
  });
});
