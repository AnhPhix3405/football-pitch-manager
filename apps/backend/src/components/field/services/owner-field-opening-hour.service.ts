import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldOpeningHourResponseDto } from '../dto/field-opening-hour-response.dto';
import { UpsertFieldOpeningHoursDto } from '../dto/upsert-field-opening-hours.dto';

@Injectable()
export class OwnerFieldOpeningHourService {
  constructor(
    private readonly openingHourRepository: FieldOpeningHourRepository,
  ) {}

  async upsertOpeningHours(
    fieldId: string,
    dto: UpsertFieldOpeningHoursDto,
  ): Promise<FieldOpeningHourResponseDto[]> {
    const seenDays = new Set<number>();

    for (const hour of dto.hours) {
      if (seenDays.has(hour.dayOfWeek)) {
        throw new ApplicationException({
          code: 'DUPLICATE_DAY_OF_WEEK',
          messageKey: 'error.invalidOpeningHours',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      seenDays.add(hour.dayOfWeek);

      if (!hour.isClosed) {
        if (!hour.openTime || !hour.closeTime) {
          throw new ApplicationException({
            code: 'INVALID_OPENING_HOURS',
            messageKey: 'error.invalidOpeningHours',
            status: HttpStatus.BAD_REQUEST,
          });
        }

        if (hour.openTime >= hour.closeTime) {
          throw new ApplicationException({
            code: 'INVALID_TIME_RANGE',
            messageKey: 'error.invalidTimeRange',
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }
    }

    const saved = await this.openingHourRepository.upsertWeeklyHours(
      fieldId,
      dto.hours,
    );

    return saved.map((h) => this.mapToResponse(h));
  }

  async getOpeningHours(
    fieldId: string,
  ): Promise<FieldOpeningHourResponseDto[]> {
    const hours = await this.openingHourRepository.findByFieldId(fieldId);
    return hours.map((h) => this.mapToResponse(h));
  }

  private mapToResponse(
    hour: FieldOpeningHourEntity,
  ): FieldOpeningHourResponseDto {
    return {
      id: hour.id,
      fieldId: hour.fieldId,
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
      createdAt: hour.createdAt,
      updatedAt: hour.updatedAt,
    };
  }
}
