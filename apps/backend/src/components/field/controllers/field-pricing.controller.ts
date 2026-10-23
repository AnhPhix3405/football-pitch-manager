import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from '~/components/auth/decorators/public.decorator';
import {
  ApiFieldPricingControllerDoc,
  ApiGetPriceQuoteDoc,
} from '../docs/field-pricing.doc';
import { PriceQuoteQueryDto } from '../dto/price-quote-query.dto';
import { PriceQuoteResponseDto } from '../dto/price-quote-response.dto';
import { FieldPricingCalculatorService } from '../services/field-pricing-calculator.service';

@ApiFieldPricingControllerDoc()
@Controller('fields/:fieldId/pricing')
export class FieldPricingController {
  constructor(
    private readonly pricingCalculator: FieldPricingCalculatorService,
  ) {}

  @Public()
  @Get('quote')
  @HttpCode(HttpStatus.OK)
  @ApiGetPriceQuoteDoc()
  async getPriceQuote(
    @Param('fieldId') fieldId: string,
    @Query() query: PriceQuoteQueryDto,
  ): Promise<PriceQuoteResponseDto> {
    return this.pricingCalculator.calculateQuote(fieldId, query);
  }
}
