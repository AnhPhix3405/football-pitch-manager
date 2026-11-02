import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Public } from '../../../components/auth/decorators/public.decorator';
import { ApiFieldRankingDocs } from '../docs/field-ranking.doc';
import { FieldRankingService } from '../services/field-ranking.service';

@ApiFieldRankingDocs.controller()
@Controller('fields/rankings')
export class FieldRankingController {
  constructor(private readonly fieldRankingService: FieldRankingService) {}

  @Public()
  @Get('top')
  @HttpCode(HttpStatus.OK)
  @ApiFieldRankingDocs.getTop()
  async getTopRankedFields(@Query('limit') limit?: number) {
    return this.fieldRankingService.getTopRankedFields(limit);
  }
}
