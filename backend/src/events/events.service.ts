import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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
      throw new BadRequestException('La date de fin doit être après la date de début');
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
      throw new BadRequestException('La date de fin doit être après la date de début');
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
}
