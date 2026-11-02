import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from '../database/config/typeorm.options';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserEntity } from '../entities/user.entity';
import { PostEntity } from '../entities/post.entity';

const PASSWORD_HASH_ROUNDS = 10;

interface SeedUser {
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  skillLevel: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'quanghai@gmail.com',
    fullName: 'Nguyễn Quang Hải',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    phone: '0901234001',
    skillLevel: 'Bán chuyên',
  },
  {
    email: 'vanhau@gmail.com',
    fullName: 'Đoàn Văn Hậu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    phone: '0901234002',
    skillLevel: 'Khá',
  },
  {
    email: 'hungdung@gmail.com',
    fullName: 'Đỗ Hùng Dũng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    phone: '0901234003',
    skillLevel: 'Khá',
  },
  {
    email: 'tienlinh@gmail.com',
    fullName: 'Nguyễn Tiến Linh',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
    phone: '0901234004',
    skillLevel: 'Trung bình khá',
  },
  {
    email: 'hoangduc@gmail.com',
    fullName: 'Nguyễn Hoàng Đức',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    phone: '0901234005',
    skillLevel: 'Bán chuyên',
  },
  {
    email: 'vanduc@gmail.com',
    fullName: 'Phan Văn Đức',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    phone: '0901234006',
    skillLevel: 'Trung bình khá',
  },
  {
    email: 'vanthanh@gmail.com',
    fullName: 'Vũ Văn Thanh',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    phone: '0901234007',
    skillLevel: 'Khá',
  },
  {
    email: 'tiendung@gmail.com',
    fullName: 'Bùi Tiến Dũng',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    phone: '0901234008',
    skillLevel: 'Trung bình',
  },
  {
    email: 'ngochai@gmail.com',
    fullName: 'Quế Ngọc Hải',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    phone: '0901234009',
    skillLevel: 'Khá',
  },
  {
    email: 'vantoan@gmail.com',
    fullName: 'Nguyễn Văn Toàn',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    phone: '0901234010',
    skillLevel: 'Trung bình khá',
  },
];

interface PostBlueprint {
  title: string;
  content: string;
  playDate: string;
  startTime: string;
  endTime: string;
  format: '5v5' | '7v7' | '11v11';
  skillLevelRequired: string;
  maxPlayers: number;
  currentPlayers: number;
  imageUrl: string;
  lat: string;
  lng: string;
}

const PITCH_IMAGES = [
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80',
];

const POST_BLUEPRINTS: PostBlueprint[] = [
  // 1
  {
    title: 'Giao hữu sân 7 - Kèo tối thứ Hai',
    content: 'Đội văn phòng đá vui vẻ, giữ chân, tìm đối tác ngang cơ giao lưu lành mạnh.',
    playDate: '2026-11-02',
    startTime: '19:00:00',
    endTime: '20:30:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình khá',
    maxPlayers: 14,
    currentPlayers: 13,
    imageUrl: PITCH_IMAGES[0],
    lat: '10.8015',
    lng: '106.6575',
  },
  // 2
  {
    title: 'Tìm đối đá sân Chảo Lửa Tân Bình',
    content: 'Sân đẹp, đèn sáng, đã cọc sân. Tìm đội đá văn minh không quẹt giò.',
    playDate: '2026-11-03',
    startTime: '20:00:00',
    endTime: '21:30:00',
    format: '7v7',
    skillLevelRequired: 'Khá',
    maxPlayers: 14,
    currentPlayers: 14,
    imageUrl: PITCH_IMAGES[1],
    lat: '10.8123',
    lng: '106.6621',
  },
  // 3
  {
    title: 'Kèo giao hữu sân 5 - Quận 10',
    content: 'Cần bắt đối sân 5 người, đá chia tiền sân vui vẻ sau giờ làm.',
    playDate: '2026-11-04',
    startTime: '18:00:00',
    endTime: '19:30:00',
    format: '5v5',
    skillLevelRequired: 'Trung bình',
    maxPlayers: 10,
    currentPlayers: 9,
    imageUrl: PITCH_IMAGES[2],
    lat: '10.7712',
    lng: '106.6698',
  },
  // 4
  {
    title: 'Tìm đối cứng giao lưu sân Phú Nhuận',
    content: 'Đội chơi lâu năm, tìm đối tác kỹ thuật tốt cọ xát chuẩn bị giải.',
    playDate: '2026-11-05',
    startTime: '19:30:00',
    endTime: '21:00:00',
    format: '7v7',
    skillLevelRequired: 'Bán chuyên',
    maxPlayers: 14,
    currentPlayers: 12,
    imageUrl: PITCH_IMAGES[3],
    lat: '10.7988',
    lng: '106.6811',
  },
  // 5
  {
    title: 'Kèo chiều thứ 6 - Sân K34 Bạch Đằng',
    content: 'Giao lưu rèn luyện thể lực cuối tuần, nước uống đầy đủ.',
    playDate: '2026-11-06',
    startTime: '17:30:00',
    endTime: '19:00:00',
    format: '7v7',
    skillLevelRequired: 'Phong trào',
    maxPlayers: 14,
    currentPlayers: 11,
    imageUrl: PITCH_IMAGES[4],
    lat: '10.8067',
    lng: '106.6644',
  },
  // 6
  {
    title: 'Bắt đối sân 11 người - Sân Thống Nhất',
    content: 'Trận sân lớn 11v11 cuối tuần, có trọng tài, tìm đội có tổ chức.',
    playDate: '2026-11-07',
    startTime: '18:00:00',
    endTime: '20:00:00',
    format: '11v11',
    skillLevelRequired: 'Khá',
    maxPlayers: 22,
    currentPlayers: 20,
    imageUrl: PITCH_IMAGES[5],
    lat: '10.7584',
    lng: '106.6578',
  },
  // 7
  {
    title: 'Sân Celadon Tân Phú - Giao hữu sân 7',
    content: 'Mặt cỏ mới tinh, không gian thoáng đãng. Tìm đối vui vẻ.',
    playDate: '2026-11-08',
    startTime: '19:00:00',
    endTime: '20:30:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình khá',
    maxPlayers: 14,
    currentPlayers: 13,
    imageUrl: PITCH_IMAGES[0],
    lat: '10.8023',
    lng: '106.6189',
  },
  // 8
  {
    title: 'Giao lưu sáng Chủ Nhật - Sân Hoa Lư Q1',
    content: 'Đá sáng thể dục thể thao, xong làm chầu cafe anh em.',
    playDate: '2026-11-08',
    startTime: '08:00:00',
    endTime: '09:30:00',
    format: '7v7',
    skillLevelRequired: 'Phong trào',
    maxPlayers: 14,
    currentPlayers: 10,
    imageUrl: PITCH_IMAGES[1],
    lat: '10.7876',
    lng: '106.7023',
  },
  // 9
  {
    title: 'Tìm đối sân 5 - Sân Thể Thao Chu Văn An',
    content: 'Kèo sân 5 tốc độ cao, anh em đều trẻ khỏe và nhiệt tình.',
    playDate: '2026-11-09',
    startTime: '18:30:00',
    endTime: '20:00:00',
    format: '5v5',
    skillLevelRequired: 'Trung bình',
    maxPlayers: 10,
    currentPlayers: 8,
    imageUrl: PITCH_IMAGES[2],
    lat: '10.8124',
    lng: '106.7032',
  },
  // 10
  {
    title: 'Kèo tối thứ Hai - Sân bóng HCA Quận 7',
    content: 'Khu Nam Sài Gòn, sân thoáng gió mát, tìm đối tác lâu dài giao lưu định kỳ.',
    playDate: '2026-11-09',
    startTime: '20:00:00',
    endTime: '21:30:00',
    format: '7v7',
    skillLevelRequired: 'Khá',
    maxPlayers: 14,
    currentPlayers: 14,
    imageUrl: PITCH_IMAGES[3],
    lat: '10.7321',
    lng: '106.7231',
  },
  // 11
  {
    title: 'Cần đối thử sức - Sân cỏ Gia Định',
    content: 'Đội sinh viên năm cuối, đá phối hợp nhỏ, tìm đối tương đương.',
    playDate: '2026-11-10',
    startTime: '17:30:00',
    endTime: '19:00:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình khá',
    maxPlayers: 14,
    currentPlayers: 12,
    imageUrl: PITCH_IMAGES[4],
    lat: '10.8055',
    lng: '106.6912',
  },
  // 12
  {
    title: 'Giao hữu sân 7 - Sân Đại Học Y Dược',
    content: 'Đá giao lưu gắn kết, sân đã thanh toán trước 100%.',
    playDate: '2026-11-10',
    startTime: '19:00:00',
    endTime: '20:30:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình',
    maxPlayers: 14,
    currentPlayers: 13,
    imageUrl: PITCH_IMAGES[5],
    lat: '10.7567',
    lng: '106.6623',
  },
  // 13
  {
    title: 'Bắt đối sân 5 - Sân cỏ mini Thủ Đức',
    content: 'Khu vực Làng Đại Học, tìm đội giao lưu vui vẻ, học hỏi kỹ năng.',
    playDate: '2026-11-11',
    startTime: '18:00:00',
    endTime: '19:30:00',
    format: '5v5',
    skillLevelRequired: 'Phong trào',
    maxPlayers: 10,
    currentPlayers: 9,
    imageUrl: PITCH_IMAGES[0],
    lat: '10.8754',
    lng: '106.7942',
  },
  // 14
  {
    title: 'Kèo tối thứ Tư - Sân Sport Plus Tân Phú',
    content: 'Mặt cỏ chuẩn FIFA, tìm đội đá chiến thuật, có trọng tài biên.',
    playDate: '2026-11-11',
    startTime: '20:00:00',
    endTime: '21:30:00',
    format: '7v7',
    skillLevelRequired: 'Bán chuyên',
    maxPlayers: 14,
    currentPlayers: 14,
    imageUrl: PITCH_IMAGES[1],
    lat: '10.7891',
    lng: '106.6345',
  },
  // 15
  {
    title: 'Giao lưu rèn thể lực - Sân Đầm Sen',
    content: 'Tìm đối đá cởi mở, không cay cú, fairplay là trên hết.',
    playDate: '2026-11-12',
    startTime: '17:30:00',
    endTime: '19:00:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình khá',
    maxPlayers: 14,
    currentPlayers: 11,
    imageUrl: PITCH_IMAGES[2],
    lat: '10.7678',
    lng: '106.6432',
  },
  // 16
  {
    title: 'Tìm đối giao hữu sân 11 - Sân Quân Khu 7',
    content: 'Kèo sân lớn, mặt cỏ tự nhiên chất lượng, tìm đội hình chuẩn 11 người.',
    playDate: '2026-11-12',
    startTime: '19:00:00',
    endTime: '21:00:00',
    format: '11v11',
    skillLevelRequired: 'Khá',
    maxPlayers: 22,
    currentPlayers: 18,
    imageUrl: PITCH_IMAGES[3],
    lat: '10.8012',
    lng: '106.6655',
  },
  // 17
  {
    title: 'Bắt đối sân 7 - Sân bóng Rạch Miễu',
    content: 'Sân trung tâm Phú Nhuận, tìm đối tác giao lưu thường xuyên hàng tuần.',
    playDate: '2026-11-06',
    startTime: '20:00:00',
    endTime: '21:30:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình khá',
    maxPlayers: 14,
    currentPlayers: 12,
    imageUrl: PITCH_IMAGES[4],
    lat: '10.7934',
    lng: '106.6901',
  },
  // 18
  {
    title: 'Tìm đội đá sân 5 - Sân Mini Cây Trâm Gò Vấp',
    content: 'Đá nhanh, di chuyển nhiều, tìm anh em đá giữ bóng văn minh.',
    playDate: '2026-11-07',
    startTime: '19:00:00',
    endTime: '20:30:00',
    format: '5v5',
    skillLevelRequired: 'Khá',
    maxPlayers: 10,
    currentPlayers: 10,
    imageUrl: PITCH_IMAGES[5],
    lat: '10.8421',
    lng: '106.6543',
  },
  // 19
  {
    title: 'Giao lưu sân 7 - Sân bóng Thảo Điền Q2',
    content: 'Đội văn phòng đa quốc gia, tìm đối cọ xát giao lưu hữu nghị.',
    playDate: '2026-11-08',
    startTime: '18:00:00',
    endTime: '19:30:00',
    format: '7v7',
    skillLevelRequired: 'Trung bình',
    maxPlayers: 14,
    currentPlayers: 11,
    imageUrl: PITCH_IMAGES[0],
    lat: '10.8034',
    lng: '106.7321',
  },
  // 20
  {
    title: 'Kèo cuối tuần - Sân Lam Sơn Quận 5',
    content: 'Trận cầu giải tỏa căng thẳng sau tuần làm việc, vui vẻ là chính.',
    playDate: '2026-11-08',
    startTime: '20:00:00',
    endTime: '21:30:00',
    format: '7v7',
    skillLevelRequired: 'Phong trào',
    maxPlayers: 14,
    currentPlayers: 13,
    imageUrl: PITCH_IMAGES[1],
    lat: '10.7543',
    lng: '106.6712',
  },
];

export const seedPosts = async (): Promise<void> => {
  console.log('[SeedPosts] Connecting to database...');
  const dataSource = new DataSource(typeOrmDataSourceOptions());
  await dataSource.initialize();
  console.log('[SeedPosts] Connected to database.');

  try {
    const userRepository = dataSource.getRepository(UserEntity);
    const profileRepository = dataSource.getRepository(UserProfileEntity);
    const postRepository = dataSource.getRepository(PostEntity);

    const defaultPasswordHash = await hash('Player@123456', PASSWORD_HASH_ROUNDS);

    // 1. Ensure 10 Users and Profiles exist
    const createdUsers: UserEntity[] = [];
    for (const seedUser of SEED_USERS) {
      let user = await userRepository.findOne({ where: { email: seedUser.email } });
      if (!user) {
        user = userRepository.create({
          id: randomUUID(),
          email: seedUser.email,
          phone: seedUser.phone,
          passwordHash: defaultPasswordHash,
          authProvider: 'local',
          role: 'user',
          status: 'active',
        });
        await userRepository.save(user);
        console.log(`[SeedPosts] Created user: ${seedUser.email}`);
      }

      let profile = await profileRepository.findOne({ where: { userId: user.id } });
      if (!profile) {
        profile = profileRepository.create({
          id: randomUUID(),
          userId: user.id,
          fullName: seedUser.fullName,
          avatarUrl: seedUser.avatarUrl,
          bio: `Cầu thủ bóng đá phong trào - Đội trưởng`,
          skillLevel: seedUser.skillLevel,
          birthday: '1996-05-15',
          gender: 'male',
        });
        await profileRepository.save(profile);
      } else {
        profile.fullName = seedUser.fullName;
        profile.avatarUrl = seedUser.avatarUrl;
        profile.skillLevel = seedUser.skillLevel;
        await profileRepository.save(profile);
      }

      createdUsers.push(user);
    }

    console.log(`[SeedPosts] Ensured ${createdUsers.length} active users with full profiles.`);

    // 2. Insert 20 Posts (2 per user)
    let postCount = 0;
    for (let i = 0; i < POST_BLUEPRINTS.length; i++) {
      const blueprint = POST_BLUEPRINTS[i];
      const ownerUser = createdUsers[i % createdUsers.length];

      // Check if similar title already exists for this user to avoid duplicates
      const existing = await postRepository.findOne({
        where: {
          userId: ownerUser.id,
          title: blueprint.title,
        },
      });

      if (!existing) {
        const post = postRepository.create({
          id: randomUUID(),
          userId: ownerUser.id,
          title: blueprint.title,
          content: blueprint.content,
          playDate: blueprint.playDate,
          startTime: blueprint.startTime,
          endTime: blueprint.endTime,
          skillLevelRequired: blueprint.skillLevelRequired,
          maxPlayers: blueprint.maxPlayers,
          currentPlayers: blueprint.currentPlayers,
          status: 'open',
          imageUrl: blueprint.imageUrl,
          lat: blueprint.lat,
          lng: blueprint.lng,
        });
        await postRepository.save(post);
        postCount++;
      }
    }

    console.log(`[SeedPosts] Successfully seeded ${postCount} new match posts with future play dates!`);
  } catch (error) {
    console.error('[SeedPosts] Error during seeding:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('[SeedPosts] Database connection closed.');
  }
};

void seedPosts();
