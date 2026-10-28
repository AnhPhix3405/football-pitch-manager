import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { STORAGE_SERVICE_TOKEN } from '~/common/storage/constants/storage.constant';
import type { IStorageService } from '~/common/storage/interfaces/storage-service.interface';
import { UserProfileRepository } from '~/repositories/user-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userRepository: UserRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  private extractStoragePath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const match = urlObj.pathname.match(/\/object\/public\/[^/]+\/(.+)$/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
      const avatarIndex = urlObj.pathname.indexOf('avatars/');
      if (avatarIndex !== -1) {
        return decodeURIComponent(urlObj.pathname.substring(avatarIndex));
      }
      const chatIndex = urlObj.pathname.indexOf('chat/');
      if (chatIndex !== -1) {
        return decodeURIComponent(urlObj.pathname.substring(chatIndex));
      }
      return null;
    } catch {
      const avatarIndex = url.indexOf('avatars/');
      if (avatarIndex !== -1) {
        return url.substring(avatarIndex).split('?')[0];
      }
      return null;
    }
  }

  async getProfileByUserId(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApplicationException({
        code: 'USER_NOT_FOUND',
        messageKey: 'error.userNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    let profile = await this.userProfileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.userProfileRepository.upsertByUserId(userId, {});
    }

    return UserProfileResponseDto.fromEntities(user, profile);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApplicationException({
        code: 'USER_NOT_FOUND',
        messageKey: 'error.userNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    let userChanged = false;

    if (dto.phone !== undefined) {
      user.phone = dto.phone || null;
      userChanged = true;
    }

    if (dto.lat !== undefined) {
      user.lat = dto.lat !== null ? String(dto.lat) : null;
      userChanged = true;
    }

    if (dto.lng !== undefined) {
      user.lng = dto.lng !== null ? String(dto.lng) : null;
      userChanged = true;
    }

    if (userChanged) {
      await this.userRepository.save(user);
    }

    // Xóa avatar cũ khỏi Supabase Storage nếu cập nhật ảnh mới
    const currentProfile =
      await this.userProfileRepository.findByUserId(userId);
    const oldAvatarUrl = currentProfile?.avatarUrl;

    if (
      dto.avatarUrl !== undefined &&
      oldAvatarUrl &&
      dto.avatarUrl !== oldAvatarUrl
    ) {
      try {
        const storagePath = this.extractStoragePath(oldAvatarUrl);
        if (storagePath) {
          await this.storageService.deleteFile(storagePath);
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to delete old avatar from Supabase: ${String(err)}`,
        );
      }
    }

    const profile = await this.userProfileRepository.upsertByUserId(userId, {
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      skillLevel: dto.skillLevel,
      birthday: dto.birthday,
      gender: dto.gender,
    });

    return UserProfileResponseDto.fromEntities(user, profile);
  }

  async updateLocation(
    userId: string,
    lat: number,
    lng: number,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApplicationException({
        code: 'USER_NOT_FOUND',
        messageKey: 'error.userNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    user.lat = String(lat);
    user.lng = String(lng);
    await this.userRepository.save(user);

    let profile = await this.userProfileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.userProfileRepository.upsertByUserId(userId, {});
    }

    return UserProfileResponseDto.fromEntities(user, profile);
  }
}
