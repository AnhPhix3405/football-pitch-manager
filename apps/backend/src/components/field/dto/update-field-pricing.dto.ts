import { PartialType } from '@nestjs/swagger';
import { CreateFieldPricingDto } from './create-field-pricing.dto';

export class UpdateFieldPricingDto extends PartialType(CreateFieldPricingDto) {}
