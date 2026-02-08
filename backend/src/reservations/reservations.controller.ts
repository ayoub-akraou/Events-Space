import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReservationStatus, Role } from '@prisma/client';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { ReservationsService } from './reservations.service';
import type { Response } from 'express';
import PDFDocument from 'pdfkit';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservations: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reservations.createReservation(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.reservations.listMyReservations(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  listAll(@Query('status') status?: string) {
    if (!status) {
      return this.reservations.listAllReservations();
    }

    const valid = (Object.values(ReservationStatus) as string[]).includes(
      status,
    );
    if (!valid) {
      throw new BadRequestException('Statut invalide');
    }

    return this.reservations.listAllReservations(status as ReservationStatus);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/refuse')
  refuse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminDecisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reservations.refuseReservation(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reservations.cancelReservation(id, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/ticket')
  async downloadTicket(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const reservation = await this.reservations.getTicketData(id, user);
    const event = reservation.event;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ticket-${reservation.ticketCode}.pdf"`,
    );

    doc.pipe(res);
    doc.fontSize(24).text('Ticket de réservation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Code: ${reservation.ticketCode}`);
    doc.text(
      `Participant: ${reservation.user.fullName ?? reservation.user.email}`,
    );
    doc.text(`Email: ${reservation.user.email}`);
    doc.moveDown();
    doc.text(`Événement: ${event.title}`);
    doc.text(`Date: ${new Date(event.startAt).toLocaleString('fr-FR')}`);
    if (event.endAt) {
      doc.text(`Fin: ${new Date(event.endAt).toLocaleString('fr-FR')}`);
    }
    if (event.location) {
      doc.text(`Lieu: ${event.location.name}`);
      if (event.location.addressLine) {
        doc.text(`Adresse: ${event.location.addressLine}`);
      }
      if (event.location.city || event.location.country) {
        doc.text(
          `Ville/Pays: ${event.location.city ?? ''} ${event.location.country ?? ''}`.trim(),
        );
      }
    }
    doc.moveDown();
    doc.text(`Statut: ${reservation.status}`);

    doc.end();
  }
}
