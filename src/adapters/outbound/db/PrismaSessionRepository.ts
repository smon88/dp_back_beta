import type { SessionRepository } from '../../../core/application/ports/SessionRepository.js';
import { prisma } from './prismaClient.js';

export class PrismaSessionRepository implements SessionRepository {
  async create(data: any) {
    const { rt_session_id, rt_session_token, ...clean } = data;
    return prisma.session.create({data: clean});
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

  async listByProjects(projectIds: string[], limit: number) {
    return prisma.session.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  }
}