import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PriceQuoteResponseDto } from '../dto/price-quote-response.dto';

export function ApiFieldPricingControllerDoc() {
  return applyDecorators(ApiTags('Field Pricing Public'));
}

export function ApiGetPriceQuoteDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tra cứu báo giá dự kiến trước khi đặt sân',
      description:
        'Trả giá cố định của khung giờ đã cấu hình đúng loại sân và nhóm ngày; không nhận khoảng giờ nằm một phần hoặc vắt qua nhiều khung.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: PriceQuoteResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Thời gian yêu cầu ngoài giờ mở cửa hoặc chưa có cấu hình giá bao phủ',
    }),
  );
}
