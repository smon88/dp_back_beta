import type {
  PanelUserRepository,
  PanelUser,
  PanelUserCreate,
  PanelUserPatch,
} from "../../../core/application/ports/PanelUserRepository.js";
import { prisma } from "./prismaClient.js";

export class PrismaPanelUserRepository implements PanelUserRepository {
  async findById(id: string): Promise<PanelUser | null> {
    return prisma.panelUser.findUnique({ where: { id } });
  }

  async findByLaravelId(laravelId: number): Promise<PanelUser | null> {
    return prisma.panelUser.findUnique({ where: { laravelId } });
  }

  async findByUsername(username: string): Promise<PanelUser | null> {
    return prisma.panelUser.findUnique({ where: { username } });
  }

  async findByTgUsername(tgUsername: string): Promise<PanelUser | null> {
    return prisma.panelUser.findFirst({ where: { tgUsername } });
  }

  async findByTgChatId(tgChatId: string): Promise<PanelUser | null> {
    return prisma.panelUser.findUnique({ where: { tgChatId } });
  }

  async create(data: PanelUserCreate): Promise<PanelUser> {
    return prisma.panelUser.create({ data });
  }

  async update(id: string, patch: PanelUserPatch): Promise<PanelUser> {
    return prisma.panelUser.update({ where: { id }, data: patch });
  }

  async updateByLaravelId(laravelId: number, patch: PanelUserPatch): Promise<PanelUser> {
    return prisma.panelUser.update({ where: { laravelId }, data: patch });
  }
}
