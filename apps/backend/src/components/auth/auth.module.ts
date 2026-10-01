import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSessionEntity } from '~/entities/auth-session.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { AuthSessionRepository } from '~/repositories/auth-session.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { AuthSessionService } from './services/auth-session.service';
import { GoogleAuthService } from './services/google-auth.service';
import { LoginGoogleService } from './services/login-google.service';
import { LoginService } from './services/login.service';
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
  controllers: [AuthController],
  providers: [
    UserRepository,
    AuthSessionRepository,
    RegisterAccountService,
    LoginService,
    GoogleAuthService,
    LoginGoogleService,
    TokenService,
    AuthSessionService,
  ],
  exports: [TokenService, AuthSessionService, AuthSessionRepository],
})
export class AuthModule {}
