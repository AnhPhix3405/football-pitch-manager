import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { UserRepository } from '~/repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { LoginGoogleService } from './services/login-google.service';
import { LoginService } from './services/login.service';
import { RegisterAccountService } from './services/register-account.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserProfileEntity])],
  controllers: [AuthController],
  providers: [
    UserRepository,
    RegisterAccountService,
    LoginService,
    GoogleAuthService,
    LoginGoogleService,
    TokenService,
  ],
  exports: [TokenService],
})
export class AuthModule {}
