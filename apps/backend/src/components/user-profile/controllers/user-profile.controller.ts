import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  ApiGetMyProfileDoc,
  ApiUpdateMyProfileDoc,
  ApiUserProfileControllerDoc,
} from '../docs/user-profile.doc';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UserProfileService } from '../services/user-profile.service';

@ApiUserProfileControllerDoc()
@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiGetMyProfileDoc()
  async getMyProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserProfileResponseDto> {
    return this.userProfileService.getProfileByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateMyProfileDoc()
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.userProfileService.updateProfile(userId, dto);
  }
}
