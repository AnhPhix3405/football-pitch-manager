import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldImageEntity } from '~/entities/field-image.entity';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { CreateFieldImageDto } from '../dto/create-field-image.dto';
import { FieldImageResponseDto } from '../dto/field-image-response.dto';
import { UpdateFieldImageDto } from '../dto/update-field-image.dto';

@Injectable()
export class OwnerFieldImageService {
  constructor(private readonly imageRepository: FieldImageRepository) {}

  async addImage(
    fieldId: string,
    dto: CreateFieldImageDto,
  ): Promise<FieldImageResponseDto> {
    const isThumbnail = dto.isThumbnail ?? false;

    const image = this.imageRepository.create({
      id: randomUUID(),
      fieldId,
      url: dto.url.trim(),
      displayOrder: dto.displayOrder ?? 0,
      isThumbnail: false, // will update atomically if true
    });

    const saved = await this.imageRepository.save(image);

    if (isThumbnail) {
      const updatedThumbnail =
        await this.imageRepository.setThumbnailTransactional(fieldId, saved.id);
      return this.mapToResponse(updatedThumbnail);
    }

    return this.mapToResponse(saved);
  }

  async getImages(fieldId: string): Promise<FieldImageResponseDto[]> {
    const images = await this.imageRepository.findByFieldId(fieldId);
    return images.map((image) => this.mapToResponse(image));
  }

  async updateImage(
    fieldId: string,
    imageId: string,
    dto: UpdateFieldImageDto,
  ): Promise<FieldImageResponseDto> {
    const image = await this.imageRepository.findByIdAndFieldId(
      imageId,
      fieldId,
    );
    if (!image) {
      throw new ApplicationException({
        code: 'IMAGE_NOT_FOUND',
        messageKey: 'error.imageNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (dto.displayOrder !== undefined) {
      image.displayOrder = dto.displayOrder;
      await this.imageRepository.save(image);
    }

    if (dto.isThumbnail === true) {
      const updatedThumbnail =
        await this.imageRepository.setThumbnailTransactional(fieldId, imageId);
      return this.mapToResponse(updatedThumbnail);
    }

    return this.mapToResponse(image);
  }

  async deleteImage(
    fieldId: string,
    imageId: string,
  ): Promise<FieldImageResponseDto> {
    const image = await this.imageRepository.findByIdAndFieldId(
      imageId,
      fieldId,
    );
    if (!image) {
      throw new ApplicationException({
        code: 'IMAGE_NOT_FOUND',
        messageKey: 'error.imageNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    await this.imageRepository.delete(image);
    return this.mapToResponse(image);
  }

  private mapToResponse(image: FieldImageEntity): FieldImageResponseDto {
    return {
      id: image.id,
      fieldId: image.fieldId,
      url: image.url,
      displayOrder: image.displayOrder,
      isThumbnail: image.isThumbnail,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
