import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Public } from '~/components/auth/decorators/public.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  OwnerProfileResponseDto,
  PublicOwnerProfileResponseDto,
} from '../dto/owner-profile-response.dto';
import { UpdateOwnerProfileDto } from '../dto/update-owner-profile.dto';
import { OwnerProfileService } from '../services/owner-profile.service';

@Controller('owner-profiles')
export class OwnerProfileController {
  constructor(private readonly ownerProfileService: OwnerProfileService) {}

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(
    @CurrentUser('id') userId: string,
  ): Promise<OwnerProfileResponseDto> {
    return this.ownerProfileService.getProfileByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOwnerProfileDto,
  ): Promise<OwnerProfileResponseDto> {
    return this.ownerProfileService.updateProfile(userId, dto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<PublicOwnerProfileResponseDto> {
    return this.ownerProfileService.getPublicProfileById(id);
  }
}
