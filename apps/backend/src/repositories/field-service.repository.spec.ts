/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { FieldServiceRepository } from './field-service.repository';

describe('FieldServiceRepository', () => {
  let repository: FieldServiceRepository;
  let typeormRepo: jest.Mocked<Repository<FieldServiceEntity>>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldServiceEntity>>;

    repository = new FieldServiceRepository(typeormRepo);
  });

  it('finds services by field ID with optional active filter', async () => {
    const mockServices = [
      { id: 'srv-1', fieldId: 'field-1', isActive: true },
    ] as FieldServiceEntity[];
    typeormRepo.find.mockResolvedValue(mockServices);

    const result = await repository.findByFieldId('field-1', true);

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { fieldId: 'field-1', isActive: true },
      order: { createdAt: 'ASC' },
    });
    expect(result).toEqual(mockServices);
  });

  it('finds service by field ID and name', async () => {
    const mockService = {
      id: 'srv-1',
      fieldId: 'field-1',
      name: 'Nước suối',
    } as FieldServiceEntity;
    typeormRepo.findOne.mockResolvedValue(mockService);

    const result = await repository.findByFieldAndName('field-1', 'Nước suối');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { fieldId: 'field-1', name: 'Nước suối' },
    });
    expect(result).toEqual(mockService);
  });
});
