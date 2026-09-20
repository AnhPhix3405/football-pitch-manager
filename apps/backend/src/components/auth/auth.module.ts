import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { UserRepository } from '~/repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { RegisterAccountService } from './services/register-account.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserProfileEntity])],
  controllers: [AuthController],
  providers: [UserRepository, RegisterAccountService],
})
export class AuthModule {}
