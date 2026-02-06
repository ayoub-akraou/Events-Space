import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservations: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: CurrentUserPayload) {
    return this.reservations.createReservation(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.reservations.listMyReservations(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/confirm')
  confirm(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminDecisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reservations.confirmReservation(id, user.userId, dto);
  }
}
