/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, EntityManager, Repository } from 'typeorm';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldOpeningHourRepository } from './field-opening-hour.repository';

describe('FieldOpeningHourRepository', () => {
  let repository: FieldOpeningHourRepository;
  let typeormRepo: jest.Mocked<Repository<FieldOpeningHourEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldOpeningHourEntity>>;

    manager = {
      delete: jest.fn().mockResolvedValue({} as any),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((cb: (em: EntityManager) => Promise<any>) =>
          cb(manager),
        ),
    } as unknown as jest.Mocked<DataSource>;

    repository = new FieldOpeningHourRepository(typeormRepo, dataSource);
  });

  it('finds opening hours ordered by dayOfWeek ASC', async () => {
    const mockHours = [
      { id: 'h-1', dayOfWeek: 1 },
      { id: 'h-2', dayOfWeek: 2 },
    ] as FieldOpeningHourEntity[];
    typeormRepo.find.mockResolvedValue(mockHours);

    const result = await repository.findByFieldId('field-1');

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { fieldId: 'field-1' },
      order: { dayOfWeek: 'ASC' },
    });
    expect(result).toEqual(mockHours);
  });

  it('upserts weekly opening hours atomically', async () => {
    const inputHours = [
      {
        dayOfWeek: 1,
        openTime: '06:00',
        closeTime: '22:00',
        isClosed: false,
      },
      {
        dayOfWeek: 2,
        openTime: '06:00',
        closeTime: '22:00',
        isClosed: false,
      },
    ];

    manager.create.mockImplementation((_entity, data) => data as any);
    manager.save.mockImplementation(async (entities: any) => entities);

    const result = await repository.upsertWeeklyHours('field-1', inputHours);

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(manager.delete).toHaveBeenCalledWith(FieldOpeningHourEntity, {
      fieldId: 'field-1',
    });
    expect(manager.save).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });
});
