import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(dto: CreateEventDto, createdById: string) {
    const startAt = new Date(dto.startAt);
    const endAt = dto.endAt ? new Date(dto.endAt) : null;

    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('Date de début invalide');
    }
    if (endAt && Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Date de fin invalide');
    }
    if (endAt && endAt < startAt) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début',
      );
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startAt,
        endAt,
        capacityMax: dto.capacityMax,
        createdById,
        locationId: dto.locationId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
        status: true,
        capacityMax: true,
        createdAt: true,
        updatedAt: true,
        locationId: true,
      },
    });
  }

  async updateEvent(eventId: string, dto: UpdateEventDto) {
    const startAt = dto.startAt ? new Date(dto.startAt) : undefined;
    const endAt = dto.endAt ? new Date(dto.endAt) : undefined;

    if (startAt && Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('Date de début invalide');
    }
    if (endAt && Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Date de fin invalide');
    }
    if (startAt && endAt && endAt < startAt) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début',
      );
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        startAt,
        endAt,
        capacityMax: dto.capacityMax,
        locationId: dto.locationId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
        status: true,
        capacityMax: true,
        updatedAt: true,
        locationId: true,
      },
    });
  }

  publishEvent(eventId: string) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
        canceledAt: null,
      },
      select: {
        id: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  }

  cancelEvent(eventId: string) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.CANCELED,
        canceledAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        canceledAt: true,
        updatedAt: true,
      },
    });
  }

  async listPublishedEvents() {
    const events = await this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { startAt: 'asc' },
      include: {
        location: true,
      },
    });

    const eventIds = events.map((event) => event.id);
    const counts = await this.prisma.reservation.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        status: 'CONFIRMED',
      },
      _count: {
        _all: true,
      },
    });

    const confirmedByEvent = new Map<string, number>(
      counts.map((count) => [count.eventId, count._count._all]),
    );

    return events.map((event) => ({
      ...event,
      remainingCapacity:
        event.capacityMax - (confirmedByEvent.get(event.id) ?? 0),
    }));
  }

  async getPublishedEventDetail(eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, status: EventStatus.PUBLISHED },
      include: { location: true },
    });

    if (!event) {
      return null;
    }

    const confirmedCount = await this.prisma.reservation.count({
      where: { eventId, status: 'CONFIRMED' },
    });

    return {
      ...event,
      remainingCapacity: event.capacityMax - confirmedCount,
    };
  }

  async listAllEvents() {
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: { location: true },
    });

    const eventIds = events.map((event) => event.id);
    const counts = eventIds.length
      ? await this.prisma.reservation.groupBy({
          by: ['eventId'],
          where: {
            eventId: { in: eventIds },
            status: 'CONFIRMED',
          },
          _count: { _all: true },
        })
      : [];

    const confirmedByEvent = new Map<string, number>(
      counts.map((count) => [count.eventId, count._count._all]),
    );

    return events.map((event) => {
      const confirmed = confirmedByEvent.get(event.id) ?? 0;
      return {
        ...event,
        confirmedReservations: confirmed,
        remainingCapacity: event.capacityMax - confirmed,
      };
    });
  }
}
