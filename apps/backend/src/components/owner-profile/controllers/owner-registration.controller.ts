import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  ApiGetOwnerRegistrationStatusDoc,
  ApiOwnerRegistrationControllerDoc,
  ApiRegisterOwnerDoc,
} from '../docs/owner-registration.doc';
import {
  OwnerRegistrationResponseDto,
  OwnerRegistrationStatusResponseDto,
} from '../dto/owner-registration-response.dto';
import { RegisterOwnerDto } from '../dto/register-owner.dto';
import { OwnerRegistrationService } from '../services/owner-registration.service';

@ApiOwnerRegistrationControllerDoc()
@Controller('owner-registration')
export class OwnerRegistrationController {
  constructor(
    private readonly ownerRegistrationService: OwnerRegistrationService,
  ) {}

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiRegisterOwnerDoc()
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterOwnerDto,
  ): Promise<OwnerRegistrationResponseDto> {
    return this.ownerRegistrationService.registerOwner(userId, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiGetOwnerRegistrationStatusDoc()
  async getStatus(
    @CurrentUser('id') userId: string,
  ): Promise<OwnerRegistrationStatusResponseDto> {
    return this.ownerRegistrationService.getRegistrationStatus(userId);
  }
}
