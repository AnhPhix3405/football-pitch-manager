import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from '../database/config/typeorm.options';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserEntity } from '../entities/user.entity';

const PASSWORD_HASH_ROUNDS = 12;

export const seedAdmin = async (): Promise<void> => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminFullName = process.env.ADMIN_FULL_NAME || 'System Administrator';
  const adminPhone = process.env.ADMIN_PHONE ? process.env.ADMIN_PHONE.trim() : null;

  console.log(`[SeedAdmin] Connecting to database...`);
  const dataSource = new DataSource(typeOrmDataSourceOptions());
  await dataSource.initialize();
  console.log(`[SeedAdmin] Database connected.`);

  try {
    const userRepository = dataSource.getRepository(UserEntity);
    const profileRepository = dataSource.getRepository(UserProfileEntity);

    let user = await userRepository.findOne({ where: { email: adminEmail } });
    const passwordHash = await hash(adminPassword, PASSWORD_HASH_ROUNDS);

    if (user) {
      console.log(`[SeedAdmin] User with email "${adminEmail}" already exists. Updating credentials and admin role...`);
      user.role = 'admin';
      user.status = 'active';
      user.passwordHash = passwordHash;
      if (adminPhone) {
        user.phone = adminPhone;
      }
      await userRepository.save(user);

      let profile = await profileRepository.findOne({ where: { userId: user.id } });
      if (!profile) {
        profile = profileRepository.create({
          id: randomUUID(),
          userId: user.id,
          fullName: adminFullName,
          avatarUrl: null,
          bio: 'System Administrator',
          skillLevel: null,
          birthday: null,
          gender: null,
        });
      } else {
        profile.fullName = adminFullName;
      }
      await profileRepository.save(profile);
      console.log(`[SeedAdmin] Admin user successfully updated: ${adminEmail} (Role: ${user.role})`);
    } else {
      console.log(`[SeedAdmin] Creating new admin account for "${adminEmail}"...`);
      user = userRepository.create({
        id: randomUUID(),
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        authProvider: 'local',
        providerId: null,
        role: 'admin',
        status: 'active',
        lat: null,
        lng: null,
      });
      await userRepository.save(user);

      const profile = profileRepository.create({
        id: randomUUID(),
        userId: user.id,
        fullName: adminFullName,
        avatarUrl: null,
        bio: 'System Administrator',
        skillLevel: null,
        birthday: null,
        gender: null,
      });
      await profileRepository.save(profile);
      console.log(`[SeedAdmin] Admin user successfully created: ${adminEmail} (Role: admin)`);
    }
  } catch (error) {
    console.error(`[SeedAdmin] Error seeding admin account:`, error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log(`[SeedAdmin] Database connection closed.`);
  }
};

if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log(`[SeedAdmin] Seeding completed successfully.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[SeedAdmin] Seeding failed:`, error);
      process.exit(1);
    });
}
