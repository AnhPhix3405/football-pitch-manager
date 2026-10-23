import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { CourtType, DayType } from '~/entities/field-pricing.entity';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { CreateFieldPricingDto } from '../dto/create-field-pricing.dto';
import { FieldPricingQueryDto } from '../dto/field-pricing-query.dto';
import { FieldPricingResponseDto } from '../dto/field-pricing-response.dto';
import { UpdateFieldPricingDto } from '../dto/update-field-pricing.dto';

@Injectable()
export class OwnerFieldPricingService {
  constructor(private readonly pricingRepository: FieldPricingRepository) {}

  async createPricing(
    fieldId: string,
    dto: CreateFieldPricingDto,
  ): Promise<FieldPricingResponseDto> {
    if (dto.startTime >= dto.endTime) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const overlaps = await this.pricingRepository.findOverlappingSlots(
      fieldId,
      dto.courtType,
      dto.dayType,
      dto.startTime,
      dto.endTime,
    );

    if (overlaps.length > 0) {
      throw new ApplicationException({
        code: 'PRICING_SLOT_OVERLAP',
        messageKey: 'error.pricingSlotOverlap',
        status: HttpStatus.CONFLICT,
      });
    }

    const entity = this.pricingRepository.create({
      id: randomUUID(),
      fieldId,
      courtType: dto.courtType as CourtType,
      dayType: dto.dayType as DayType,
      startTime: dto.startTime,
      endTime: dto.endTime,
      price: dto.price.toString(),
    });

    const saved = await this.pricingRepository.save(entity);
    return FieldPricingResponseDto.fromEntity(saved);
  }

  async getPricingList(
    fieldId: string,
    query: FieldPricingQueryDto,
  ): Promise<FieldPricingResponseDto[]> {
    const list = await this.pricingRepository.findByField(fieldId, query);
    return list.map((item) => FieldPricingResponseDto.fromEntity(item));
  }

  async updatePricing(
    fieldId: string,
    pricingId: string,
    dto: UpdateFieldPricingDto,
  ): Promise<FieldPricingResponseDto> {
    const existing = await this.pricingRepository.findByIdAndFieldId(
      pricingId,
      fieldId,
    );

    if (!existing) {
      throw new ApplicationException({
        code: 'PRICING_NOT_FOUND',
        messageKey: 'error.pricingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const courtType = dto.courtType ?? existing.courtType;
    const dayType = dto.dayType ?? existing.dayType;
    const startTime = dto.startTime ?? existing.startTime.slice(0, 5);
    const endTime = dto.endTime ?? existing.endTime.slice(0, 5);

    if (startTime >= endTime) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const overlaps = await this.pricingRepository.findOverlappingSlots(
      fieldId,
      courtType,
      dayType,
      startTime,
      endTime,
      pricingId,
    );

    if (overlaps.length > 0) {
      throw new ApplicationException({
        code: 'PRICING_SLOT_OVERLAP',
        messageKey: 'error.pricingSlotOverlap',
        status: HttpStatus.CONFLICT,
      });
    }

    if (dto.courtType) existing.courtType = dto.courtType as CourtType;
    if (dto.dayType) existing.dayType = dto.dayType as DayType;
    if (dto.startTime) existing.startTime = dto.startTime;
    if (dto.endTime) existing.endTime = dto.endTime;
    if (dto.price !== undefined) existing.price = dto.price.toString();

    const saved = await this.pricingRepository.save(existing);
    return FieldPricingResponseDto.fromEntity(saved);
  }

  async deletePricing(
    fieldId: string,
    pricingId: string,
  ): Promise<{ success: boolean }> {
    const existing = await this.pricingRepository.findByIdAndFieldId(
      pricingId,
      fieldId,
    );

    if (!existing) {
      throw new ApplicationException({
        code: 'PRICING_NOT_FOUND',
        messageKey: 'error.pricingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    await this.pricingRepository.delete(existing);
    return { success: true };
  }
}
