import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiFieldRankingDocs = {
  controller: () => applyDecorators(ApiTags('Field Rankings')),

  getTop: () =>
    applyDecorators(
      ApiOperation({
        summary:
          'Lấy bảng xếp hạng top các sân bóng đánh giá cao nhất theo Bayesian score',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách top sân bóng xếp hạng theo Bayesian score',
      }),
    ),
};
