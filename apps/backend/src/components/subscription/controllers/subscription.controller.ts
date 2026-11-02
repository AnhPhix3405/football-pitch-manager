import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiSubscriptionDocs } from '../docs/subscription.doc';
import { SubscribePlanDto } from '../dto/subscribe-plan.dto';
import { SubscriptionService } from '../services/subscription.service';

@ApiSubscriptionDocs.controller()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSubscriptionDocs.subscribe()
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribePlanDto,
  ) {
    return this.subscriptionService.subscribe(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiSubscriptionDocs.getMyActive()
  async getMyActive(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getMyActiveSubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSubscriptionDocs.cancel()
  async cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.subscriptionService.cancelSubscription(userId, id);
  }
}
