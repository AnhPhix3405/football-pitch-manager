import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { FieldServiceResponseDto } from '../dto/field-service-response.dto';
import { PublicFieldQueryDto } from '../dto/public-field-query.dto';

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Injectable()
export class FieldService {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private readonly fieldServiceRepository: FieldServiceRepository,
    private readonly fieldImageRepository: FieldImageRepository,
  ) {}

  async getPublicFields(
    query: PublicFieldQueryDto,
  ): Promise<FieldListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));

    const { items, total } =
      await this.fieldRepository.findActiveFieldsWithPagination({
        page,
        limit,
        search: query.search,
        district: query.district,
        requireDeposit: query.requireDeposit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

    const images = await this.fieldImageRepository.findByFieldIds(
      items.map((item) => item.id),
    );
    const imagesByField = new Map<string, typeof images>();
    for (const image of images) {
      const fieldImages = imagesByField.get(image.fieldId) ?? [];
      fieldImages.push(image);
      imagesByField.set(image.fieldId, fieldImages);
    }

    return {
      items: items.map((item) =>
        this.mapToPublicResponseDto(item, imagesByField.get(item.id) ?? []),
      ),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async getPublicFieldDetail(id: string): Promise<FieldResponseDto> {
    if (!UUID_REGEX.test(id)) {
      throw new ApplicationException({
        code: 'INVALID_FIELD_ID',
        messageKey: 'error.invalidFieldId',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const field = await this.fieldRepository.findActiveById(id);

    if (!field) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const images = await this.fieldImageRepository.findByFieldId(id);
    return this.mapToPublicResponseDto(field, images);
  }

  async getPublicFieldServices(
    fieldId: string,
  ): Promise<FieldServiceResponseDto[]> {
    if (!UUID_REGEX.test(fieldId)) {
      throw new ApplicationException({
        code: 'INVALID_FIELD_ID',
        messageKey: 'error.invalidFieldId',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const field = await this.fieldRepository.findActiveById(fieldId);

    if (!field) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const services = await this.fieldServiceRepository.findByFieldId(
      fieldId,
      true,
    );

    return services.map((s) => ({
      id: s.id,
      fieldId: s.fieldId,
      name: s.name,
      price: Number(s.price),
      unit: s.unit,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  private mapToResponseDto(field: FieldEntity): FieldResponseDto {
    return {
      id: field.id,
      ownerId: field.ownerId,
      name: field.name,
      address: field.address,
      district: field.district,
      lat: field.lat !== null ? Number(field.lat) : null,
      lng: field.lng !== null ? Number(field.lng) : null,
      description: field.description,
      status: field.status,
      requireDeposit: field.requireDeposit,
      depositType: field.depositType,
      depositValue:
        field.depositValue !== null ? Number(field.depositValue) : null,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    };
  }

  private mapToPublicResponseDto(
    field: FieldEntity,
    images: { url: string; isThumbnail: boolean }[],
  ): FieldResponseDto {
    const thumbnail = images.find((image) => image.isThumbnail) ?? images[0];
    return {
      ...this.mapToResponseDto(field),
      imageUrl: thumbnail?.url ?? null,
      images: thumbnail
        ? [
            thumbnail.url,
            ...images
              .filter((image) => image !== thumbnail)
              .map((image) => image.url),
          ]
        : [],
    };
  }
}
