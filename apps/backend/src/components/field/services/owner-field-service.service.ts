import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { CreateFieldServiceDto } from '../dto/create-field-service.dto';
import { FieldServiceResponseDto } from '../dto/field-service-response.dto';
import { UpdateFieldServiceDto } from '../dto/update-field-service.dto';

@Injectable()
export class OwnerFieldServiceService {
  constructor(private readonly serviceRepository: FieldServiceRepository) {}

  async createService(
    fieldId: string,
    dto: CreateFieldServiceDto,
  ): Promise<FieldServiceResponseDto> {
    const trimmedName = dto.name.trim();

    // Check unique service name in field
    const existing = await this.serviceRepository.findByFieldAndName(
      fieldId,
      trimmedName,
    );
    if (existing) {
      throw new ApplicationException({
        code: 'SERVICE_NAME_ALREADY_EXISTS',
        messageKey: 'error.serviceNameAlreadyExists',
        status: HttpStatus.CONFLICT,
      });
    }

    const service = this.serviceRepository.create({
      id: randomUUID(),
      fieldId,
      name: trimmedName,
      price: String(dto.price),
      unit: dto.unit?.trim() ?? null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.serviceRepository.save(service);
    return this.mapToResponse(saved);
  }

  async getServices(
    fieldId: string,
    isActive?: boolean,
  ): Promise<FieldServiceResponseDto[]> {
    const services = await this.serviceRepository.findByFieldId(
      fieldId,
      isActive,
    );
    return services.map((s) => this.mapToResponse(s));
  }

  async updateService(
    fieldId: string,
    serviceId: string,
    dto: UpdateFieldServiceDto,
  ): Promise<FieldServiceResponseDto> {
    const service = await this.serviceRepository.findByIdAndFieldId(
      serviceId,
      fieldId,
    );
    if (!service) {
      throw new ApplicationException({
        code: 'SERVICE_NOT_FOUND',
        messageKey: 'error.serviceNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (trimmedName !== service.name) {
        const existing = await this.serviceRepository.findByFieldAndName(
          fieldId,
          trimmedName,
        );
        if (existing && existing.id !== serviceId) {
          throw new ApplicationException({
            code: 'SERVICE_NAME_ALREADY_EXISTS',
            messageKey: 'error.serviceNameAlreadyExists',
            status: HttpStatus.CONFLICT,
          });
        }
        service.name = trimmedName;
      }
    }

    if (dto.price !== undefined) {
      service.price = String(dto.price);
    }

    if (dto.unit !== undefined) {
      service.unit = dto.unit?.trim() ?? null;
    }

    if (dto.isActive !== undefined) {
      service.isActive = dto.isActive;
    }

    const saved = await this.serviceRepository.save(service);
    return this.mapToResponse(saved);
  }

  async deleteService(
    fieldId: string,
    serviceId: string,
  ): Promise<FieldServiceResponseDto> {
    const service = await this.serviceRepository.findByIdAndFieldId(
      serviceId,
      fieldId,
    );
    if (!service) {
      throw new ApplicationException({
        code: 'SERVICE_NOT_FOUND',
        messageKey: 'error.serviceNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    service.isActive = false;
    const saved = await this.serviceRepository.save(service);
    return this.mapToResponse(saved);
  }

  private mapToResponse(service: FieldServiceEntity): FieldServiceResponseDto {
    return {
      id: service.id,
      fieldId: service.fieldId,
      name: service.name,
      price: Number(service.price),
      unit: service.unit,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
