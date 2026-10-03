import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  OwnerRegistrationResponseDto,
  OwnerRegistrationStatusResponseDto,
} from '../dto/owner-registration-response.dto';
import { RegisterOwnerDto } from '../dto/register-owner.dto';
import { OwnerRegistrationService } from '../services/owner-registration.service';

@ApiTags('Owner Registration')
@ApiBearerAuth()
@Controller('owner-registration')
export class OwnerRegistrationController {
  constructor(
    private readonly ownerRegistrationService: OwnerRegistrationService,
  ) {}

  @ApiOperation({
    summary: 'Gửi hồ sơ đăng ký trở thành chủ sân',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Gửi yêu cầu đăng ký thành công, chờ Admin phê duyệt',
    type: OwnerRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Tài khoản đã là chủ sân hoặc đang có một yêu cầu khác chờ phê duyệt',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
  })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterOwnerDto,
  ): Promise<OwnerRegistrationResponseDto> {
    return this.ownerRegistrationService.registerOwner(userId, dto);
  }

  @ApiOperation({
    summary: 'Tra cứu trạng thái hồ sơ và yêu cầu đăng ký chủ sân gần nhất',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin trạng thái thành công',
    type: OwnerRegistrationStatusResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
  })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @CurrentUser('id') userId: string,
  ): Promise<OwnerRegistrationStatusResponseDto> {
    return this.ownerRegistrationService.getRegistrationStatus(userId);
  }
}
