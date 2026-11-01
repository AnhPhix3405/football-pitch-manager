import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';

@Injectable()
export class PostMatchRepository extends BaseRepository<PostMatchEntity> {
  constructor(
    @InjectRepository(PostMatchEntity) repository: Repository<PostMatchEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository?: Repository<UserProfileEntity>,
  ) {
    super(repository);
  }

  async findByPostId(postId: string): Promise<PostMatchEntity[]> {
    const matches = await this.repository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.applicant', 'applicant')
      .where('match.postId = :postId', { postId })
      .orderBy('match.createdAt', 'DESC')
      .getMany();

    await this.attachApplicantProfiles(matches);
    return matches;
  }

  async findByPostAndApplicant(
    postId: string,
    applicantId: string,
  ): Promise<PostMatchEntity | null> {
    const match = await this.repository.findOne({
      where: { postId, applicantId },
      relations: { applicant: true },
    });
    if (match) {
      await this.attachApplicantProfiles([match]);
    }
    return match;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status });
  }

  private async attachApplicantProfiles(
    matches: PostMatchEntity[],
  ): Promise<void> {
    if (!this.profileRepository || !matches || matches.length === 0) return;
    const applicantIds = [
      ...new Set(matches.map((m) => m.applicantId).filter(Boolean)),
    ];
    if (applicantIds.length === 0) return;

    try {
      const profiles = await this.profileRepository.find({
        where: { userId: In(applicantIds) },
      });
      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      for (const match of matches) {
        if (match.applicant) {
          const profile = profileMap.get(match.applicantId);
          Object.assign(match.applicant, {
            fullName: profile?.fullName || null,
            avatarUrl: profile?.avatarUrl || null,
          });
        }
      }
    } catch {
      // Graceful fallback
    }
  }
}
