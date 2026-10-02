import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { AuthModule } from '../auth/auth.module';
import { OwnerProfileController } from './controllers/owner-profile.controller';
import { OwnerProfileService } from './services/owner-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OwnerProfileEntity]),
    AuthModule,
  ],
  controllers: [OwnerProfileController],
  providers: [OwnerProfileRepository, OwnerProfileService],
  exports: [OwnerProfileRepository, OwnerProfileService],
})
export class OwnerProfileModule {}
