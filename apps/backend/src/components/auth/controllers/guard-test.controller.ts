import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AllowedStatuses } from '../decorators/account-status.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AccountStatusGuard } from '../guards/account-status.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Controller('auth/test')
export class GuardTestController {
  @Public()
  @Get('public')
  @HttpCode(HttpStatus.OK)
  getPublic() {
    return {
      message: 'Public endpoint accessible without authentication',
    };
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('user-id')
  @HttpCode(HttpStatus.OK)
  getUserId(@CurrentUser('id') userId: string) {
    return {
      userId,
    };
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Get('owner-only')
  @HttpCode(HttpStatus.OK)
  getOwnerOnly(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Owner resource accessed successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  @HttpCode(HttpStatus.OK)
  getAdminOnly(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Admin resource accessed successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @AllowedStatuses('active')
  @Get('active-only')
  @HttpCode(HttpStatus.OK)
  getActiveOnly(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Active account verified',
      user,
    };
  }
}
