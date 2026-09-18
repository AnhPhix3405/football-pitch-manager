import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { UuidEntity } from '~/core/entities/uuid.entity';

export abstract class BaseRepository<T extends UuidEntity> {
  protected constructor(protected readonly repository: Repository<T>) {}

  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  findById(id: string): Promise<T | null> {
    return this.repository.findOneBy({
      id,
    } as FindOptionsWhere<T>);
  }

  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  delete(entity: T): Promise<T> {
    return this.repository.remove(entity);
  }

  deleteById(id: string): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  softDelete(entity: T): Promise<T> {
    return this.repository.softRemove(entity);
  }

  deleteMany(entities: T[]): Promise<T[]> {
    if (!entities.length) {
      return Promise.resolve([]);
    }

    return this.repository.remove(entities);
  }
}
