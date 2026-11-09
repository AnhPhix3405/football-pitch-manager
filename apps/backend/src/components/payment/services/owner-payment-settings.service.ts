import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { FieldEntity } from '~/entities/field.entity';
import { OwnerPaymentMerchantEntity } from '~/entities/owner-payment-merchant.entity';
import { BookingPaymentOption } from '../constants/payment.constant';
import { OwnerPaymentSettingsDto } from '../dto/owner-payment-settings.dto';

@Injectable()
export class OwnerPaymentSettingsService {
  constructor(
    private readonly db: DataSource,
    private readonly config: ConfigService,
  ) {}

  private key(): Buffer {
    const value =
      this.config.get<string>('VNPAY_MERCHANT_ENCRYPTION_KEY') ?? '';
    if (!/^[0-9a-f]{64}$/i.test(value)) {
      throw new ServiceUnavailableException({
        messageKey: 'error.merchantEncryptionUnavailable',
      });
    }
    return Buffer.from(value, 'hex');
  }

  private encrypt(secret: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const encrypted = Buffer.concat([
      cipher.update(secret, 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
      'base64',
    );
  }

  async credentials(merchantId: string, manager = this.db.manager) {
    const merchant = await manager
      .getRepository(OwnerPaymentMerchantEntity)
      .createQueryBuilder('merchant')
      .addSelect('merchant.encryptedSecret')
      .where('merchant.id = :merchantId', { merchantId })
      .getOneOrFail();
    const data = Buffer.from(merchant.encryptedSecret, 'base64');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key(),
      data.subarray(0, 12),
    );
    decipher.setAuthTag(data.subarray(12, 28));
    const hashSecret = Buffer.concat([
      decipher.update(data.subarray(28)),
      decipher.final(),
    ]).toString('utf8');
    return { tmnCode: merchant.terminalCode, hashSecret };
  }

  latestMerchant(ownerId: string, manager = this.db.manager) {
    return manager.findOne(OwnerPaymentMerchantEntity, {
      where: { ownerId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  private publicSettings(field: FieldEntity) {
    return {
      options: field.paymentOptions ?? [BookingPaymentOption.CASH],
      depositType: field.depositType,
      depositValue:
        field.depositValue === null ? null : Number(field.depositValue),
    };
  }

  private async ownedField(
    manager: EntityManager,
    fieldId: string,
    ownerId: string,
  ) {
    const field = await manager.findOneBy(FieldEntity, {
      id: fieldId,
      ownerId,
    });
    if (!field)
      throw new NotFoundException({ messageKey: 'error.fieldNotFound' });
    return field;
  }

  async getPublic(fieldId: string) {
    const field = await this.db.manager.findOneBy(FieldEntity, {
      id: fieldId,
      status: 'active',
    });
    if (!field)
      throw new NotFoundException({ messageKey: 'error.fieldNotFound' });
    return this.publicSettings(field);
  }

  async getOwner(fieldId: string, ownerId: string) {
    const field = await this.ownedField(this.db.manager, fieldId, ownerId);
    const merchant = await this.latestMerchant(ownerId);
    return {
      ...this.publicSettings(field),
      terminalCode: merchant?.terminalCode ?? null,
    };
  }

  async update(fieldId: string, ownerId: string, dto: OwnerPaymentSettingsDto) {
    return this.db.transaction(async (manager) => {
      const field = await this.ownedField(manager, fieldId, ownerId);
      const hasDeposit = dto.options.includes(BookingPaymentOption.DEPOSIT);
      if (
        hasDeposit &&
        (!dto.depositType ||
          !dto.depositValue ||
          (dto.depositType === 'percentage' && dto.depositValue > 100))
      ) {
        throw new BadRequestException({
          messageKey: 'error.invalidPaymentDeposit',
        });
      }
      let merchant = await this.latestMerchant(ownerId, manager);
      if (dto.hashSecret) {
        const terminalCode = dto.terminalCode ?? merchant?.terminalCode;
        if (!terminalCode)
          throw new BadRequestException({
            messageKey: 'error.merchantTerminalRequired',
          });
        merchant = await manager.save(
          OwnerPaymentMerchantEntity,
          manager.create(OwnerPaymentMerchantEntity, {
            id: randomUUID(),
            ownerId,
            terminalCode,
            encryptedSecret: this.encrypt(dto.hashSecret),
          }),
        );
      } else if (
        dto.terminalCode &&
        dto.terminalCode !== merchant?.terminalCode
      ) {
        throw new BadRequestException({
          messageKey: 'error.merchantSecretRequired',
        });
      }
      if (
        !merchant &&
        dto.options.some((option) => option !== BookingPaymentOption.CASH)
      ) {
        throw new BadRequestException({
          messageKey: 'error.merchantConfigurationRequired',
        });
      }
      field.paymentOptions = dto.options;
      field.requireDeposit = hasDeposit;
      field.depositType = hasDeposit ? dto.depositType! : null;
      field.depositValue = hasDeposit ? String(dto.depositValue) : null;
      await manager.update(
        FieldEntity,
        { id: fieldId, ownerId },
        {
          paymentOptions: field.paymentOptions,
          requireDeposit: field.requireDeposit,
          depositType: field.depositType,
          depositValue: field.depositValue,
        },
      );
      return {
        ...this.publicSettings(field),
        terminalCode: merchant?.terminalCode ?? null,
      };
    });
  }
}
