import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
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
}
