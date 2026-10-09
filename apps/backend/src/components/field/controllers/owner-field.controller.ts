import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import {
  ApiCreateFieldDoc,
  ApiDeactivateFieldDoc,
  ApiGetOwnerFieldDetailDoc,
  ApiGetOwnerFieldsDoc,
  ApiOwnerFieldControllerDoc,
  ApiUpdateFieldDoc,
} from '../docs/owner-field.doc';
import { CreateFieldDto } from '../dto/create-field.dto';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { OwnerFieldQueryDto } from '../dto/owner-field-query.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { OwnerFieldService } from '../services/owner-field.service';

@ApiOwnerFieldControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@Controller('owner/fields')
export class OwnerFieldController {
  constructor(private readonly ownerFieldService: OwnerFieldService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFieldDoc()
  async createField(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.ownerFieldService.createField(ownerId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetOwnerFieldsDoc()
  async getOwnerFields(
    @CurrentUser('id') ownerId: string,
    @Query() query: OwnerFieldQueryDto,
  ): Promise<FieldListResponseDto> {
    return this.ownerFieldService.getOwnerFields(ownerId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiGetOwnerFieldDetailDoc()
  async getOwnerFieldDetail(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
  ): Promise<FieldResponseDto> {
    return this.ownerFieldService.getOwnerFieldDetail(id, ownerId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateFieldDoc()
  async updateField(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.ownerFieldService.updateField(id, ownerId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeactivateFieldDoc()
  async deactivateField(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
  ): Promise<FieldResponseDto> {
    return this.ownerFieldService.deactivateField(id, ownerId);
  }
}
