// src/adapters/outbound/db/PrismaBinLookupRepository.ts
import { PrismaClient } from "@prisma/client";

export type BinRecord = {
  bin: string;
  scheme?: string | null;
  brand?: string | null;
  type?: string | null;
  level?: string | null;
  bank?: string | null;
  bankPhone?: string | null;
  country?: string | null;
  currency?: string | null;
  source?: string | null;
  fetchedAt?: Date | null;
};

export class PrismaBinLookupRepository {
  constructor(private prisma: PrismaClient) {}

  async findByBin(bin: string) {
    return this.prisma.binLookup.findUnique({ where: { bin } });
  }

  async upsertByBin(data: BinRecord) {
    return this.prisma.binLookup.upsert({
      where: { bin: data.bin },
      create: {
        ...data,
        fetchedAt: data.fetchedAt ?? new Date(),
      },
      update: {
        ...data,
        fetchedAt: data.fetchedAt ?? new Date(),
      },
    });
  }
}
