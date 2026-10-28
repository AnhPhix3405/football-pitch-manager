import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'ID hồ sơ người dùng',
    example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412',
  })
  id!: string;

  @ApiProperty({
    description: 'ID tài khoản người dùng',
    example: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
  })
  userId!: string;

  @ApiProperty({
    description: 'Email người dùng',
    example: 'user@pitchmaster.vn',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0901234567',
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({
    description: 'Vai trò người dùng trong hệ thống',
    example: 'user',
  })
  role!: string;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: 'active',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn A',
    nullable: true,
  })
  fullName!: string | null;

  @ApiPropertyOptional({
    description: 'Ảnh đại diện',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiPropertyOptional({
    description: 'Tiểu sử / Giới thiệu',
    example: 'Đam mê bóng đá',
    nullable: true,
  })
  bio!: string | null;

  @ApiPropertyOptional({
    description: 'Trình độ bóng đá',
    example: 'Trung bình',
    nullable: true,
  })
  skillLevel!: string | null;

  @ApiPropertyOptional({
    description: 'Ngày sinh (YYYY-MM-DD)',
    example: '1995-10-20',
    nullable: true,
  })
  birthday!: string | null;

  @ApiPropertyOptional({
    description: 'Giới tính',
    example: 'male',
    nullable: true,
  })
  gender!: string | null;

  @ApiPropertyOptional({
    description: 'Vĩ độ vị trí người dùng',
    example: 10.762622,
    nullable: true,
  })
  lat!: number | null;

  @ApiPropertyOptional({
    description: 'Kinh độ vị trí người dùng',
    example: 106.660172,
    nullable: true,
  })
  lng!: number | null;

  @ApiProperty({
    description: 'Thời điểm tạo hồ sơ',
    example: '2026-01-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật hồ sơ gần nhất',
    example: '2026-01-01T10:30:00.000Z',
  })
  updatedAt!: Date;

  static fromEntities(
    user: UserEntity,
    profile?: UserProfileEntity | null,
  ): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.id = profile?.id ?? user.id;
    dto.userId = user.id;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.role = user.role;
    dto.status = user.status;
    dto.fullName = profile?.fullName ?? null;
    dto.avatarUrl = profile?.avatarUrl ?? null;
    dto.bio = profile?.bio ?? null;
    dto.skillLevel = profile?.skillLevel ?? null;
    dto.birthday = profile?.birthday ?? null;
    dto.gender = profile?.gender ?? null;
    dto.lat =
      user.lat !== null && user.lat !== undefined ? Number(user.lat) : null;
    dto.lng =
      user.lng !== null && user.lng !== undefined ? Number(user.lng) : null;
    dto.createdAt = profile?.createdAt ?? user.createdAt;
    dto.updatedAt = profile?.updatedAt ?? user.updatedAt;
    return dto;
  }
}
