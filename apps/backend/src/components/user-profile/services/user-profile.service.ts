import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserProfileRepository } from '~/repositories/user-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userRepository: UserRepository,
  ) {}

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

    if (dto.phone !== undefined) {
      user.phone = dto.phone || null;
      await this.userRepository.save(user);
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
}
