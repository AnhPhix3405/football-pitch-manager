import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSessionEntity } from '~/entities/auth-session.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { AuthSessionRepository } from '~/repositories/auth-session.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { GuardTestController } from './controllers/guard-test.controller';
import { AccountStatusGuard } from './guards/account-status.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthSessionService } from './services/auth-session.service';
import { GoogleAuthService } from './services/google-auth.service';
import { LoginGoogleService } from './services/login-google.service';
import { LoginService } from './services/login.service';
import { LogoutService } from './services/logout.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { RegisterAccountService } from './services/register-account.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      AuthSessionEntity,
    ]),
  ],
  controllers: [AuthController, GuardTestController],
  providers: [
    UserRepository,
    AuthSessionRepository,
    RegisterAccountService,
    LoginService,
    GoogleAuthService,
    LoginGoogleService,
    TokenService,
    AuthSessionService,
    RefreshTokenService,
    LogoutService,
    JwtAuthGuard,
    AccountStatusGuard,
    RolesGuard,
  ],
  exports: [
    TokenService,
    AuthSessionService,
    AuthSessionRepository,
    RefreshTokenService,
    LogoutService,
    JwtAuthGuard,
    AccountStatusGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
