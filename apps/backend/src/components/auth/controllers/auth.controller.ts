import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginService } from '../services/login.service';
import { RegisterAccountService } from '../services/register-account.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAccountService: RegisterAccountService,
    private readonly loginService: LoginService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() input: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.registerAccountService.execute(input);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() input: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.loginService.execute(input);
    return {
      messageKey: 'success.loginSuccess',
      data: user,
    };
  }
}
