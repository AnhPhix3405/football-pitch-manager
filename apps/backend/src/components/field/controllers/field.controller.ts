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
  ApiGetPublicFieldDetailDoc,
  ApiGetPublicFieldsDoc,
  ApiPublicFieldControllerDoc,
} from '../docs/public-field.doc';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { PublicFieldQueryDto } from '../dto/public-field-query.dto';
import { FieldService } from '../services/field.service';

@ApiPublicFieldControllerDoc()
@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Public()
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetPublicFieldsDoc()
  async getPublicFields(
    @Query() query: PublicFieldQueryDto,
  ): Promise<FieldListResponseDto> {
    return this.fieldService.getPublicFields(query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiGetPublicFieldDetailDoc()
  async getPublicFieldDetail(
    @Param('id') id: string,
  ): Promise<FieldResponseDto> {
    return this.fieldService.getPublicFieldDetail(id);
  }
}
