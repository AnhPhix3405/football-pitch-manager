import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '~/components/auth/decorators/public.decorator';
import { Roles } from '~/components/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/components/auth/guards/roles.guard';
import { ApiSubscriptionPlanDocs } from '../docs/subscription.doc';
import { CreateSubscriptionPlanDto } from '../dto/create-subscription-plan.dto';
import { SubscriptionPlanService } from '../services/subscription-plan.service';

@ApiSubscriptionPlanDocs.controller()
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSubscriptionPlanDocs.createPlan()
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.createPlan(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiSubscriptionPlanDocs.getActivePlans()
  async getActivePlans() {
    return this.subscriptionPlanService.getActivePlans();
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSubscriptionPlanDocs.getPlanDetail()
  async getPlanDetail(@Param('id') id: string) {
    return this.subscriptionPlanService.getPlanById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiSubscriptionPlanDocs.deactivatePlan()
  async deactivatePlan(@Param('id') id: string) {
    return this.subscriptionPlanService.deactivatePlan(id);
  }
}
