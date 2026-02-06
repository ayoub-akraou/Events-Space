import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventStatus, ReservationStatus } from '@prisma/client';

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
}
