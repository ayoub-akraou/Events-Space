import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(() => {
    // PrismaService requires DATABASE_URL at construction time. For unit tests we only need
    // a syntactically valid URL; we do not call $connect here.
    process.env.DATABASE_URL ??=
      'postgresql://user:pass@localhost:5432/test_db';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
