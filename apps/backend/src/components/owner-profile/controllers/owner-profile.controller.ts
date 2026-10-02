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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Owner Profiles')
@Controller('owner-profiles')
export class OwnerProfileController {
  constructor(private readonly ownerProfileService: OwnerProfileService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết hồ sơ chủ sân của tài khoản đang đăng nhập',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin hồ sơ chủ sân thành công',
    type: OwnerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chưa khởi tạo hồ sơ chủ sân',
  })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(
    @CurrentUser('id') userId: string,
  ): Promise<OwnerProfileResponseDto> {
    return this.ownerProfileService.getProfileByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo mới hoặc cập nhật thông tin hồ sơ chủ sân của tài khoản hiện tại',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin hồ sơ chủ sân thành công',
    type: OwnerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
  })
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
  @ApiOperation({
    summary: 'Xem thông tin công khai của chủ sân theo ID hồ sơ',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của hồ sơ chủ sân',
    example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin công khai thành công',
    type: PublicOwnerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hồ sơ chủ sân',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<PublicOwnerProfileResponseDto> {
    return this.ownerProfileService.getPublicProfileById(id);
  }
}
