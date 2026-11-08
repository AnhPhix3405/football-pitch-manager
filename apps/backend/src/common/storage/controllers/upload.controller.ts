import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '~/components/auth/decorators/public.decorator';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  STORAGE_SERVICE_TOKEN,
} from '../constants/storage.constant';
import type { IStorageService } from '../interfaces/storage-service.interface';
import { LocalImageStorageService } from '../services/local-image-storage.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
    private readonly localStorage: LocalImageStorageService,
  ) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      properties: {
        url: { type: 'string', example: 'https://.../chat/uuid.jpg' },
        path: { type: 'string', example: 'chat/uuid.jpg' },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Storage folder (e.g. avatars, chat)',
    example: 'avatars',
  })
  async uploadImage(
    @CurrentUser('id') userId: string,
    @Req() req: FastifyRequest,
    @Query('folder') folder?: string,
  ) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Không tìm thấy file tải lên');
    }

    if (
      !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)
    ) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF',
      );
    }

    const buffer = await file.toBuffer();
    if (this.localStorage.enabled) {
      return this.localStorage.save(buffer, file.mimetype);
    }
    const ext = file.filename?.split('.').pop() || 'jpg';
    const targetFolder =
      folder === 'avatars' || folder === 'avatar' ? 'avatars' : 'chat';
    const filePath = `${targetFolder}/${userId}/${randomUUID()}.${ext}`;

    const result = await this.storageService.uploadFile({
      path: filePath,
      fileBuffer: buffer,
      contentType: file.mimetype,
    });

    return {
      url: result.publicUrl,
      path: result.path,
    };
  }

  @Public()
  @Get('local/:name')
  async getLocalImage(@Param('name') name: string, @Res() reply: FastifyReply) {
    const { buffer, mimeType } = await this.localStorage.read(name);
    void reply
      .header('X-Content-Type-Options', 'nosniff')
      .type(mimeType)
      .send(buffer);
  }
}
