import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryRankingsDto } from '../dto/query-rankings.dto';
import { RankingService } from '../services/ranking.service';

@ApiTags('Bảng xếp hạng (Leaderboard)')
@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('fields')
  @ApiOperation({
    summary: 'Lấy bảng xếp hạng Top sân bóng uy tín nhất theo điểm Bayesian',
  })
  async getFieldRankings(@Query() query: QueryRankingsDto) {
    return this.rankingService.getFieldRankings(query.limit || 20);
  }

  @Get('players')
  @ApiOperation({
    summary: 'Lấy bảng xếp hạng Top người chơi thể thao gương mẫu / fair-play',
  })
  async getPlayerRankings(@Query() query: QueryRankingsDto) {
    return this.rankingService.getPlayerRankings(query.limit || 20);
  }
}
