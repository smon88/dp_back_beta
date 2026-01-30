import type {
  OtpRepository,
  OtpCode,
  OtpCodeCreate,
} from "../../../core/application/ports/OtpRepository.js";
import { prisma } from "./prismaClient.js";

export class PrismaOtpRepository implements OtpRepository {
  async create(data: OtpCodeCreate): Promise<OtpCode> {
    return prisma.otpCode.create({ data });
  }

  async findValidByUserId(panelUserId: string): Promise<OtpCode | null> {
    return prisma.otpCode.findFirst({
      where: {
        panelUserId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsUsed(id: string): Promise<OtpCode> {
    return prisma.otpCode.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.otpCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
