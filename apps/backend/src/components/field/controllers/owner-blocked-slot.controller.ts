import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllowedStatuses } from '~/components/auth/decorators/account-status.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { CheckFieldOwnership } from '../decorators/check-field-ownership.decorator';
import {
  ApiCreateBlockedSlotDoc,
  ApiDeleteBlockedSlotDoc,
  ApiGetBlockedSlotsDoc,
  ApiOwnerBlockedSlotControllerDoc,
} from '../docs/owner-blocked-slot.doc';
import { BlockedSlotQueryDto } from '../dto/blocked-slot-query.dto';
import { BlockedSlotResponseDto } from '../dto/blocked-slot-response.dto';
import { CreateBlockedSlotDto } from '../dto/create-blocked-slot.dto';
import { FieldOwnershipGuard } from '../guards/field-ownership.guard';
import { OwnerBlockedSlotService } from '../services/owner-blocked-slot.service';

@ApiOwnerBlockedSlotControllerDoc()
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard, FieldOwnershipGuard)
@Roles('owner', 'admin')
@AllowedStatuses('active')
@CheckFieldOwnership({ param: 'fieldId' })
@Controller('owner/fields/:fieldId/courts/:courtId/blocked-slots')
export class OwnerBlockedSlotController {
  constructor(private readonly slotService: OwnerBlockedSlotService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateBlockedSlotDoc()
  async createBlockedSlot(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
    @Body() dto: CreateBlockedSlotDto,
  ): Promise<BlockedSlotResponseDto> {
    return this.slotService.createBlockedSlot(fieldId, courtId, dto);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiGetBlockedSlotsDoc()
  async getBlockedSlots(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
    @Query() query: BlockedSlotQueryDto,
  ): Promise<BlockedSlotResponseDto[]> {
    return this.slotService.getBlockedSlots(fieldId, courtId, query);
  }

  @Delete(':slotId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteBlockedSlotDoc()
  async deleteBlockedSlot(
    @Param('fieldId') fieldId: string,
    @Param('courtId') courtId: string,
    @Param('slotId') slotId: string,
  ): Promise<BlockedSlotResponseDto> {
    return this.slotService.deleteBlockedSlot(fieldId, courtId, slotId);
  }
}
