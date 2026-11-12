import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { DayType } from '~/entities/field-pricing.entity';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { PriceQuoteQueryDto } from '../dto/price-quote-query.dto';
import {
  PriceQuoteResponseDto,
  PriceQuoteSegmentDto,
} from '../dto/price-quote-response.dto';

const parseMinutes = (timeStr: string): number => {
  const [hh, mm] = timeStr.slice(0, 5).split(':').map(Number);
  return hh * 60 + mm;
};

const toTimeString = (minutes: number): string => {
  const hh = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

@Injectable()
export class FieldPricingCalculatorService {
  constructor(
    private readonly pricingRepository: FieldPricingRepository,
    private readonly openingHourRepository: FieldOpeningHourRepository,
  ) {}

  determineDayType(dateStr: string): DayType {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend';
    }
    return 'weekday';
  }

  async calculateQuote(
    fieldId: string,
    query: PriceQuoteQueryDto,
  ): Promise<PriceQuoteResponseDto> {
    const reqStart = parseMinutes(query.startTime);
    const reqEnd = parseMinutes(query.endTime);

    if (reqStart >= reqEnd) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 1. Verify opening hours
    const [year, month, day] = query.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay();
    const isoDayOfWeek = jsDay === 0 ? 7 : jsDay;

    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      fieldId,
      isoDayOfWeek,
    );

    if (
      !openingHour ||
      openingHour.isClosed ||
      !openingHour.openTime ||
      !openingHour.closeTime
    ) {
      throw new ApplicationException({
        code: 'OUTSIDE_OPENING_HOURS',
        messageKey: 'error.outsideOpeningHours',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const openMin = parseMinutes(openingHour.openTime);
    const closeMin = parseMinutes(openingHour.closeTime);

    if (reqStart < openMin || reqEnd > closeMin) {
      throw new ApplicationException({
        code: 'OUTSIDE_OPENING_HOURS',
        messageKey: 'error.outsideOpeningHours',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 2. Fetch pricing rules
    const dayType = this.determineDayType(query.date);
    const rules = await this.pricingRepository.findByField(fieldId, {
      courtType: query.courtType,
      dayType,
    });

    const matchingRule = rules.find(
      (rule) =>
        parseMinutes(rule.startTime) === reqStart &&
        parseMinutes(rule.endTime) === reqEnd,
    );
    if (!matchingRule) {
      throw new ApplicationException({
        code: 'PRICE_CONFIGURATION_MISSING',
        messageKey: 'error.priceConfigurationMissing',
        status: HttpStatus.BAD_REQUEST,
        details: { date: query.date, courtType: query.courtType },
      });
    }

    const totalPrice = Number(matchingRule.price);
    const totalDurationMinutes = reqEnd - reqStart;
    const breakdown: PriceQuoteSegmentDto[] = [
      {
        startTime: toTimeString(reqStart),
        endTime: toTimeString(reqEnd),
        durationMinutes: totalDurationMinutes,
        slotPrice: totalPrice,
        subtotal: totalPrice,
      },
    ];

    return {
      fieldId,
      courtType: query.courtType,
      date: query.date,
      dayType,
      startTime: query.startTime,
      endTime: query.endTime,
      totalDurationMinutes,
      totalPrice,
      breakdown,
    };
  }
}
