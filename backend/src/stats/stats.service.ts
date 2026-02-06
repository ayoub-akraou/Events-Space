import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus, ReservationStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const [
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalReservations,
      confirmedReservations,
      pendingReservations,
      canceledReservations,
    ] = await this.prisma.$transaction([
      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
      this.prisma.event.count({
        where: { status: EventStatus.PUBLISHED, startAt: { gt: now } },
      }),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { status: ReservationStatus.CONFIRMED } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.CANCELED } }),
    ]);

    return {
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalReservations,
      confirmedReservations,
      pendingReservations,
      canceledReservations,
    };
  }
}
