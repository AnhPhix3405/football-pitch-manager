import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldImageEntity } from '~/entities/field-image.entity';

@Injectable()
export class FieldImageRepository extends BaseRepository<FieldImageEntity> {
  constructor(
    @InjectRepository(FieldImageEntity)
    repository: Repository<FieldImageEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async findByFieldId(fieldId: string): Promise<FieldImageEntity[]> {
    return this.repository.find({
      where: { fieldId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findByIdAndFieldId(
    id: string,
    fieldId: string,
  ): Promise<FieldImageEntity | null> {
    return this.repository.findOne({
      where: { id, fieldId },
    });
  }

  async findThumbnail(fieldId: string): Promise<FieldImageEntity | null> {
    return this.repository.findOne({
      where: { fieldId, isThumbnail: true },
    });
  }

  async setThumbnailTransactional(
    fieldId: string,
    imageId: string,
  ): Promise<FieldImageEntity> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Unmark previous thumbnail
      await manager.update(
        FieldImageEntity,
        { fieldId, isThumbnail: true },
        { isThumbnail: false },
      );

      // 2. Mark target image as thumbnail
      const image = await manager.findOne(FieldImageEntity, {
        where: { id: imageId, fieldId },
      });

      if (!image) {
        throw new Error('Image not found');
      }

      image.isThumbnail = true;
      return manager.save(image);
    });
  }
}
