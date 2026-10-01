import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { GoogleLoginRequestDto } from '../dto/google-login-request.dto';
import { GoogleLoginResponseDto } from '../dto/google-login-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { LoginGoogleService } from '../services/login-google.service';
import { LoginService } from '../services/login.service';
import { LogoutService } from '../services/logout.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RegisterAccountService } from '../services/register-account.service';
import { TokenService } from '../services/token.service';
import {
  clearRefreshTokenCookie,
  extractRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from '../utils/auth-cookie.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAccountService: RegisterAccountService,
    private readonly loginService: LoginService,
    private readonly loginGoogleService: LoginGoogleService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutService: LogoutService,
    private readonly tokenService: TokenService,
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

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginGoogle(
    @Body() input: GoogleLoginRequestDto,
  ): Promise<GoogleLoginResponseDto> {
    const user = await this.loginGoogleService.execute(input);
    return {
      messageKey: 'success.loginGoogleSuccess',
      data: user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenRequestDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<RefreshTokenResponseDto> {
    const cookieName = this.tokenService.getRefreshCookieName();
    const token = extractRefreshTokenFromRequest(req, cookieName, body?.refreshToken);

    const result = await this.refreshTokenService.execute(token);

    setRefreshTokenCookie(
      reply,
      cookieName,
      result.tokens.refreshToken,
      this.tokenService.getRefreshTokenCookieOptions(),
    );

    return {
      messageKey: 'success.refreshSuccess',
      data: {
        accessToken: result.tokens.accessToken,
        tokenType: result.tokens.tokenType,
        expiresIn: result.tokens.expiresIn,
        user: result.user,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() body: RefreshTokenRequestDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<LogoutResponseDto> {
    const cookieName = this.tokenService.getRefreshCookieName();
    const token = extractRefreshTokenFromRequest(req, cookieName, body?.refreshToken);

    await this.logoutService.execute(token);

    clearRefreshTokenCookie(reply, cookieName, '/api/auth');

    return {
      messageKey: 'success.logoutSuccess',
      data: null,
    };
  }
}
