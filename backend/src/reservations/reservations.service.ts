import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventStatus, ReservationStatus, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async createReservation(dto: CreateReservationDto, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, status: true, capacityMax: true },
    });

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Événement indisponible');
    }

    const existing = await this.prisma.reservation.findFirst({
      where: { userId, eventId: dto.eventId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Réservation déjà existante');
    }

    const confirmedCount = await this.prisma.reservation.count({
      where: { eventId: dto.eventId, status: ReservationStatus.CONFIRMED },
    });
    if (confirmedCount >= event.capacityMax) {
      throw new ConflictException('Capacité maximale atteinte');
    }

    return this.prisma.reservation.create({
      data: {
        userId,
        eventId: dto.eventId,
        status: ReservationStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        eventId: true,
        userId: true,
      },
    });
  }

  listMyReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          include: { location: true },
        },
      },
    });
  }

  listAllReservations(status?: ReservationStatus) {
    return this.prisma.reservation.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        event: { include: { location: true } },
        user: true,
      },
    });
  }

  async confirmReservation(
    reservationId: string,
    adminId: string,
    dto: AdminDecisionDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { event: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Réservation non confirmable');
    }
    if (reservation.event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Événement indisponible');
    }

    const confirmedCount = await this.prisma.reservation.count({
      where: {
        eventId: reservation.eventId,
        status: ReservationStatus.CONFIRMED,
      },
    });
    if (confirmedCount >= reservation.event.capacityMax) {
      throw new ConflictException('Capacité maximale atteinte');
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
        decidedById: adminId,
        adminNote: dto.adminNote,
      },
      include: { event: true, user: true },
    });
  }

  async refuseReservation(
    reservationId: string,
    adminId: string,
    dto: AdminDecisionDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, status: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Réservation non refusable');
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.REFUSED,
        refusedAt: new Date(),
        decidedById: adminId,
        adminNote: dto.adminNote,
      },
      include: { event: true, user: true },
    });
  }

  async cancelReservation(
    reservationId: string,
    user: CurrentUserPayload,
    dto: CancelReservationDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && reservation.userId !== user.userId) {
      throw new ForbiddenException('Accès interdit');
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Réservation déjà annulée');
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: dto.cancelReason,
        decidedById: isAdmin ? user.userId : null,
      },
      include: { event: true, user: true },
    });
  }

  async getTicketData(reservationId: string, user: CurrentUserPayload) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { event: { include: { location: true } }, user: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Ticket indisponible');
    }

    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && reservation.userId !== user.userId) {
      throw new ForbiddenException('Accès interdit');
    }

    if (!reservation.ticketCode) {
      const ticketCode = randomUUID();
      const updated = await this.prisma.reservation.update({
        where: { id: reservationId },
        data: { ticketCode },
        include: { event: { include: { location: true } }, user: true },
      });
      return updated;
    }

    return reservation;
  }
}
