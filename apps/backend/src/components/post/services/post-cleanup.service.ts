import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { PostRepository } from '~/repositories/post.repository';

@Injectable()
export class PostCleanupService {
  private readonly logger = new Logger(PostCleanupService.name);

  constructor(private readonly postRepository: PostRepository) {}

  @Cron('*/10 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCloseExpiredPostsToday(): Promise<void> {
    try {
      const closedCount = await this.closeExpiredPostsToday();
      if (closedCount > 0) {
        this.logger.log(
          `[Cron 10m] Đã tự động chuyển ${closedCount} bài đăng quá giờ trong ngày sang trạng thái closed.`,
        );
      }
    } catch (error) {
      this.logger.error('Lỗi khi thực thi cron đóng bài đăng quá giờ:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleMidnightCleanup(): Promise<void> {
    try {
      const result = await this.midnightCleanup();
      this.logger.log(
        `Hoàn tất dọn dẹp 12h đêm: Đã soft delete ${result.softDeletedCount} bài đăng ngày hôm trước, xóa vĩnh viễn ${result.hardDeletedCount} bài đăng đã lưu trữ quá 7 ngày.`,
      );
    } catch (error) {
      this.logger.error('Lỗi khi thực thi cron dọn dẹp 12h đêm:', error);
    }
  }

  /**
   * Thực hiện đóng các bài đăng quá giờ trong ngày hôm nay.
   */
  async closeExpiredPostsToday(): Promise<number> {
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs().format('HH:mm:ss');
    return await this.postRepository.closeExpiredPostsToday(today, currentTime);
  }

  /**
   * Thực hiện nghiệp vụ dọn dẹp ban đêm:
   * 1. Soft delete bài của các ngày trước đó.
   * 2. Hard delete bài đã soft delete quá 7 ngày.
   */
  async midnightCleanup(): Promise<{
    softDeletedCount: number;
    hardDeletedCount: number;
  }> {
    const today = dayjs().format('YYYY-MM-DD');
    const softDeletedCount =
      await this.postRepository.softDeleteExpiredPosts(today);

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();
    const hardDeletedCount =
      await this.postRepository.hardDeleteExpiredPosts(sevenDaysAgo);

    return {
      softDeletedCount,
      hardDeletedCount,
    };
  }
}
