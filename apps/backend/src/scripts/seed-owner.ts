import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from '../database/config/typeorm.options';
import { FieldEntity } from '../entities/field.entity';
import { OwnerProfileEntity } from '../entities/owner-profile.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserEntity } from '../entities/user.entity';

const PASSWORD_HASH_ROUNDS = 12;

export const seedOwner = async (): Promise<void> => {
  const ownerEmail = (process.env.OWNER_EMAIL || 'owner@example.com')
    .trim()
    .toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@123456';
  const ownerFullName = process.env.OWNER_FULL_NAME || 'Nguyễn Văn Chủ Sân';
  const ownerPhone = (process.env.OWNER_PHONE || '0988123456').trim();
  const businessName =
    process.env.OWNER_BUSINESS_NAME || 'Chảo Lửa Tân Bình Sports Complex';
  const businessLicense =
    process.env.OWNER_BUSINESS_LICENSE || 'GPKD-0318999999';
  const bankAccount =
    process.env.OWNER_BANK_ACCOUNT ||
    'MBBank - 0988123456 - NGUYEN VAN CHU SAN';

  console.log(`[SeedOwner] Connecting to database...`);
  const dataSource = new DataSource(typeOrmDataSourceOptions());
  await dataSource.initialize();
  console.log(`[SeedOwner] Database connected.`);

  try {
    const userRepository = dataSource.getRepository(UserEntity);
    const profileRepository = dataSource.getRepository(UserProfileEntity);
    const ownerProfileRepository = dataSource.getRepository(OwnerProfileEntity);
    const fieldRepository = dataSource.getRepository(FieldEntity);

    let user = await userRepository.findOne({
      where: [{ email: ownerEmail }, { phone: ownerPhone }],
    });
    const passwordHash = await hash(ownerPassword, PASSWORD_HASH_ROUNDS);

    if (user) {
      console.log(
        `[SeedOwner] User with email "${ownerEmail}" already exists. Updating to active owner...`,
      );
      user.role = 'owner';
      user.status = 'active';
      user.passwordHash = passwordHash;
      user.phone = ownerPhone;
      await userRepository.save(user);
    } else {
      console.log(
        `[SeedOwner] Creating new owner user account for "${ownerEmail}"...`,
      );
      user = userRepository.create({
        id: randomUUID(),
        email: ownerEmail,
        phone: ownerPhone,
        passwordHash,
        authProvider: 'local',
        providerId: null,
        role: 'owner',
        status: 'active',
        lat: '10.801234',
        lng: '106.654321',
      });
      await userRepository.save(user);
    }

    // Ensure UserProfileEntity
    let profile = await profileRepository.findOne({
      where: { userId: user.id },
    });
    if (!profile) {
      profile = profileRepository.create({
        id: randomUUID(),
        userId: user.id,
        fullName: ownerFullName,
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Quản lý cụm sân bóng đá chuyên nghiệp',
        skillLevel: null,
        birthday: null,
        gender: null,
      });
    } else {
      profile.fullName = ownerFullName;
    }
    await profileRepository.save(profile);

    // Ensure OwnerProfileEntity
    let ownerProfile = await ownerProfileRepository.findOne({
      where: { userId: user.id },
    });
    if (!ownerProfile) {
      ownerProfile = ownerProfileRepository.create({
        id: randomUUID(),
        userId: user.id,
        businessName,
        businessLicense,
        bankAccount,
        verifiedAt: new Date(),
      });
    } else {
      ownerProfile.businessName = businessName;
      ownerProfile.businessLicense = businessLicense;
      ownerProfile.bankAccount = bankAccount;
      ownerProfile.verifiedAt = ownerProfile.verifiedAt || new Date();
    }
    await ownerProfileRepository.save(ownerProfile);
    console.log(
      `[SeedOwner] Owner profile verified for "${ownerEmail}" (${businessName}).`,
    );

    // Ensure at least one active sample field owned by this owner
    let field = await fieldRepository.findOne({
      where: { ownerId: user.id },
    });
    if (!field) {
      console.log(
        `[SeedOwner] Creating sample active field for owner "${ownerEmail}"...`,
      );
      field = fieldRepository.create({
        id: randomUUID(),
        ownerId: user.id,
        name: 'Sân bóng Chảo Lửa Tân Bình',
        address: '30 Phan Thúc Duyện, Phường 4, Tân Bình, TP.HCM',
        district: 'Quận Tân Bình',
        lat: '10.8012345',
        lng: '106.6543210',
        description:
          'Cụm sân cỏ nhân tạo đạt chuẩn FIFA, hệ thống chiếu sáng LED hiện đại, bãi xe rộng rãi, có căn tin phục vụ giải khát.',
        status: 'active',
        requireDeposit: true,
        depositType: 'percentage',
        depositValue: '30.00',
      });
      await fieldRepository.save(field);
      console.log(
        `[SeedOwner] Sample field created: "${field.name}" (ID: ${field.id}).`,
      );
    } else {
      console.log(
        `[SeedOwner] Owner already has field: "${field.name}" (ID: ${field.id}).`,
      );
    }

    console.log(`-----------------------------------------------------`);
    console.log(`[SeedOwner] Successfully seeded Owner Account:`);
    console.log(`  - Email:    ${ownerEmail}`);
    console.log(`  - Password: ${ownerPassword}`);
    console.log(`  - Role:     ${user.role}`);
    console.log(`  - Status:   ${user.status}`);
    console.log(`  - Field:    ${field.name} (${field.id})`);
    console.log(`-----------------------------------------------------`);
  } catch (error) {
    console.error(`[SeedOwner] Error seeding owner account:`, error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log(`[SeedOwner] Database connection closed.`);
  }
};

if (require.main === module) {
  seedOwner()
    .then(() => {
      console.log(`[SeedOwner] Seeding completed successfully.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[SeedOwner] Seeding failed:`, error);
      process.exit(1);
    });
}
