import { prisma } from './prismaClient.js';

export class PrismaSessionRepository {
  async create(data: any) {
    return prisma.session.create({data});
  }

  async findById(id: string) {
    return prisma.session.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.session.update({ where: { id }, data });
  }

  async listRecent(limit = 200) {
    return prisma.session.findMany({ orderBy: { updatedAt: "desc" }, take: limit });
  }
}