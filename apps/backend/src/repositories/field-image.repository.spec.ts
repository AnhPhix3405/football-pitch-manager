/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, EntityManager, Repository } from 'typeorm';
import { FieldImageEntity } from '~/entities/field-image.entity';
import { FieldImageRepository } from './field-image.repository';

describe('FieldImageRepository', () => {
  let repository: FieldImageRepository;
  let typeormRepo: jest.Mocked<Repository<FieldImageEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldImageEntity>>;

    manager = {
      update: jest.fn().mockResolvedValue({} as any),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((cb: (em: EntityManager) => Promise<any>) =>
          cb(manager),
        ),
    } as unknown as jest.Mocked<DataSource>;

    repository = new FieldImageRepository(typeormRepo, dataSource);
  });

  it('finds images ordered by displayOrder ASC', async () => {
    const mockImages = [{ id: 'img-1', displayOrder: 0 }] as FieldImageEntity[];
    typeormRepo.find.mockResolvedValue(mockImages);

    const result = await repository.findByFieldId('field-1');

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { fieldId: 'field-1' },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    expect(result).toEqual(mockImages);
  });

  it('sets thumbnail atomically within transaction', async () => {
    const targetImage = {
      id: 'img-2',
      fieldId: 'field-1',
      isThumbnail: false,
    } as FieldImageEntity;
    const updatedImage = {
      ...targetImage,
      isThumbnail: true,
    } as FieldImageEntity;

    manager.findOne.mockResolvedValue(targetImage);
    manager.save.mockResolvedValue(updatedImage);

    const result = await repository.setThumbnailTransactional(
      'field-1',
      'img-2',
    );

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(manager.update).toHaveBeenCalledWith(
      FieldImageEntity,
      { fieldId: 'field-1', isThumbnail: true },
      { isThumbnail: false },
    );
    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'img-2', isThumbnail: true }),
    );
    expect(result.isThumbnail).toBe(true);
  });
});
