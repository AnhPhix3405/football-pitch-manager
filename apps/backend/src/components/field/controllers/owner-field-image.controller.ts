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
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { CheckFieldOwnership } from '../decorators/check-field-ownership.decorator';
import {
  ApiCreateFieldImageDoc,
  ApiDeleteFieldImageDoc,
  ApiGetFieldImagesDoc,
  ApiOwnerFieldImageControllerDoc,
  ApiUpdateFieldImageDoc,
} from '../docs/owner-field-image.doc';
import { CreateFieldImageDto } from '../dto/create-field-image.dto';
import { FieldImageResponseDto } from '../dto/field-image-response.dto';
import { UpdateFieldImageDto } from '../dto/update-field-image.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerFieldImageService } from '../services/owner-field-image.service';

@ApiOwnerFieldImageControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/images')
export class OwnerFieldImageController {
  constructor(private readonly imageService: OwnerFieldImageService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFieldImageDoc()
  async addImage(
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateFieldImageDto,
  ): Promise<FieldImageResponseDto> {
    return this.imageService.addImage(fieldId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetFieldImagesDoc()
  async getImages(
    @Param('fieldId') fieldId: string,
  ): Promise<FieldImageResponseDto[]> {
    return this.imageService.getImages(fieldId);
  }

  @Patch(':imageId')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateFieldImageDoc()
  async updateImage(
    @Param('fieldId') fieldId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateFieldImageDto,
  ): Promise<FieldImageResponseDto> {
    return this.imageService.updateImage(fieldId, imageId, dto);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteFieldImageDoc()
  async deleteImage(
    @Param('fieldId') fieldId: string,
    @Param('imageId') imageId: string,
  ): Promise<FieldImageResponseDto> {
    return this.imageService.deleteImage(fieldId, imageId);
  }
}
