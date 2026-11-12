import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldEntity } from '~/entities/field.entity';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { AdminFieldDetailResponseDto } from '../dto/admin-field-detail-response.dto';
import { AdminFieldKpiResponseDto } from '../dto/admin-field-kpi-response.dto';
import {
  AdminFieldCourtsSummaryDto,
  AdminFieldItemDto,
  AdminFieldListResponseDto,
  AdminFieldOwnerSummaryDto,
  AdminFieldRatingSummaryDto,
} from '../dto/admin-field-list-response.dto';
import { AdminFieldQueryDto } from '../dto/admin-field-query.dto';
import { UpdateAdminFieldStatusDto } from '../dto/update-admin-field-status.dto';

@Injectable()
export class AdminFieldService {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private readonly fieldCourtRepository: FieldCourtRepository,
    private readonly fieldImageRepository: FieldImageRepository,
    private readonly fieldServiceRepository: FieldServiceRepository,
    private readonly fieldOpeningHourRepository: FieldOpeningHourRepository,
    private readonly fieldPricingRepository: FieldPricingRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getFields(
    query: AdminFieldQueryDto,
  ): Promise<AdminFieldListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));

    const { items: fields, total } =
      await this.fieldRepository.findAdminFieldsWithPagination({
        page,
        limit,
        search: query.search,
        status: query.status,
        district: query.district,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

    const items: AdminFieldItemDto[] = await Promise.all(
      fields.map(async (field) => {
        const courts = await this.fieldCourtRepository.findByFieldId(field.id);
        return this.mapToItemDto(field, courts);
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async getKpi(): Promise<AdminFieldKpiResponseDto> {
    const kpiCounts = await this.fieldRepository.countAdminKpi();
    const totalCourts = await this.fieldCourtRepository.countTotal();
    const depositRequiredCount =
      await this.fieldRepository.countDepositRequired();

    return {
      totalFields: kpiCounts.totalFields,
      activeFields: kpiCounts.activeFields,
      inactiveFields: kpiCounts.inactiveFields,
      pendingFields: kpiCounts.pendingFields,
      rejectedFields: kpiCounts.rejectedFields,
      totalCourts,
      depositRequiredCount,
    };
  }

  async getFieldDetail(id: string): Promise<AdminFieldDetailResponseDto> {
    const field = await this.fieldRepository.findById(id);
    if (!field) {
      throw new NotFoundException(`Không tìm thấy sân bóng với ID: ${id}`);
    }

    const [courts, images, services] = await Promise.all([
      this.fieldCourtRepository.findByFieldId(id),
      this.fieldImageRepository.findByFieldId(id),
      this.fieldServiceRepository.findByFieldId(id),
    ]);

    const courtsSummary = this.summarizeCourts(courts);
    const depositFormatted = this.formatDeposit(field);
    const owner = this.mapOwner(field);
    const ratingSummary: AdminFieldRatingSummaryDto = {
      averageRating: 0,
      totalReviews: 0,
      bayesianRating: 0,
    };

    return {
      id: field.id,
      name: field.name,
      address: field.address,
      district: field.district ?? null,
      lat: field.lat ? Number(field.lat) : null,
      lng: field.lng ? Number(field.lng) : null,
      description: field.description ?? null,
      status: field.status as 'active' | 'inactive' | 'pending' | 'rejected',
      requireDeposit: field.requireDeposit,
      depositType: field.depositType ?? null,
      depositValue: field.depositValue ? Number(field.depositValue) : null,
      depositFormatted,
      owner,
      courtsSummary,
      courts: courts.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        createdAt: c.createdAt ? c.createdAt.toISOString() : undefined,
      })),
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        displayOrder: img.displayOrder,
        isThumbnail: img.isThumbnail,
      })),
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        unit: s.unit ?? null,
        isActive: s.isActive,
      })),
      ratingSummary,
      createdAt: field.createdAt ? field.createdAt.toISOString() : '',
      updatedAt: field.updatedAt ? field.updatedAt.toISOString() : '',
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateAdminFieldStatusDto,
  ): Promise<AdminFieldItemDto> {
    return this.dataSource.transaction(async (manager) => {
      const fieldRepo = manager.getRepository(FieldEntity);
      const courtRepo = manager.getRepository(FieldCourtEntity);

      const field = await fieldRepo.findOne({
        where: { id },
        relations: { owner: true },
      });

      if (!field) {
        throw new NotFoundException(`Không tìm thấy sân bóng với ID: ${id}`);
      }

      field.status = dto.status;
      const savedField = await fieldRepo.save(field);

      // Cascade deactivation: if field becomes inactive, cascade update all child courts to inactive
      if (dto.status === 'inactive') {
        await courtRepo.update({ fieldId: id }, { status: 'inactive' });
      }

      const courts = await this.fieldCourtRepository.findByFieldId(id);
      return this.mapToItemDto(savedField, courts);
    });
  }

  private mapToItemDto(
    field: FieldEntity,
    courts: FieldCourtEntity[],
  ): AdminFieldItemDto {
    const courtsSummary = this.summarizeCourts(courts);
    const depositFormatted = this.formatDeposit(field);
    const owner = this.mapOwner(field);

    return {
      id: field.id,
      name: field.name,
      address: field.address,
      district: field.district ?? null,
      lat: field.lat ? Number(field.lat) : null,
      lng: field.lng ? Number(field.lng) : null,
      status: field.status as 'active' | 'inactive' | 'pending' | 'rejected',
      requireDeposit: field.requireDeposit,
      depositFormatted,
      owner,
      courtsSummary,
      ratingSummary: {
        averageRating: 0,
        totalReviews: 0,
        bayesianRating: 0,
      },
      createdAt: field.createdAt ? field.createdAt.toISOString() : '',
      updatedAt: field.updatedAt ? field.updatedAt.toISOString() : '',
    };
  }

  private summarizeCourts(
    courts: FieldCourtEntity[],
  ): AdminFieldCourtsSummaryDto {
    let type5 = 0;
    let type7 = 0;
    let type11 = 0;
    let activeCount = 0;

    for (const c of courts) {
      if (c.type === '5') type5++;
      else if (c.type === '7') type7++;
      else if (c.type === '11') type11++;

      if (c.status === 'active') activeCount++;
    }

    return {
      total: courts.length,
      type5,
      type7,
      type11,
      activeCount,
    };
  }

  private formatDeposit(field: FieldEntity): string {
    if (!field.requireDeposit) {
      return 'Không cọc';
    }
    if (field.depositType === 'percentage') {
      return `${field.depositValue ?? 0}% (Tỷ lệ)`;
    }
    const val = Number(field.depositValue) || 0;
    const formattedNum = new Intl.NumberFormat('vi-VN').format(val);
    return `${formattedNum} ₫ (Cố định)`;
  }

  private mapOwner(field: FieldEntity): AdminFieldOwnerSummaryDto {
    const owner = field.owner;
    return {
      id: owner?.id ?? field.ownerId,
      fullName:
        (owner as any)?.fullName ??
        (owner?.email ? owner.email.split('@')[0] : 'Chủ sân'),
      email: owner?.email ?? 'N/A',
      phoneNumber: owner?.phone ?? null,
    };
  }
}
