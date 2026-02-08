import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateLocationDto) {
    return this.prisma.location.create({
      data: {
        name: dto.name,
        addressLine: dto.addressLine,
        city: dto.city,
        country: dto.country,
        notes: dto.notes,
      },
    });
  }
}
