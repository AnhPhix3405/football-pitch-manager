import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterAccountService } from '../services/register-account.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAccountService: RegisterAccountService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() input: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.registerAccountService.execute(input);
  }
}
