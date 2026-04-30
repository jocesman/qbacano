import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('sales/daily')
  getDailySales() { return this.statsService.getDailySales(); }

  @Get('products/top')
  getTopProducts() { return this.statsService.getTopProducts(); }

  @Get('revenue/monthly')
  getMonthlyRevenue() { return this.statsService.getMonthlyRevenue(); }
}
