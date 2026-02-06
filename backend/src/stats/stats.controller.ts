import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('overview')
  getOverview() {
    return this.stats.getOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('occupancy')
  getOccupancy() {
    return this.stats.getOccupancyRates();
  }
}
