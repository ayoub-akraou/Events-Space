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

  async getOccupancyRates() {
    const events = await this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      select: { id: true, title: true, capacityMax: true, startAt: true },
      orderBy: { startAt: 'asc' },
    });

    const eventIds = events.map((event) => event.id);
    const counts = await this.prisma.reservation.groupBy({
      by: ['eventId'],
      where: { eventId: { in: eventIds }, status: ReservationStatus.CONFIRMED },
      _count: { _all: true },
    });

    const confirmedByEvent = new Map<string, number>(
      counts.map((count) => [count.eventId, count._count._all]),
    );

    return events.map((event) => {
      const confirmed = confirmedByEvent.get(event.id) ?? 0;
      const fillRate = event.capacityMax > 0 ? confirmed / event.capacityMax : 0;

      return {
        eventId: event.id,
        title: event.title,
        capacityMax: event.capacityMax,
        confirmed,
        fillRate,
        startAt: event.startAt,
      };
    });
  }
}
