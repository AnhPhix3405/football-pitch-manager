import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { UserProfileRepository } from '~/repositories/user-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfileEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [UserProfileController],
  providers: [UserProfileRepository, UserRepository, UserProfileService],
  exports: [UserProfileRepository, UserProfileService],
})
export class UserProfileModule {}
