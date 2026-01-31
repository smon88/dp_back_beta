import type { SessionRepository } from "../ports/SessionRepository.js";
import type { ProjectRepository } from "../ports/ProjectRepository.js";
import type { RealtimeGateway } from "../ports/RealtimeGateway.js";

type BootstrapInput = {
  socketId: string;
  panelUserId: string;
  panelRole: "ADMIN" | "USER";
  limit?: number;
};

export class AdminBootstrap {
  constructor(
    private repo: SessionRepository,
    private projectRepo: ProjectRepository,
    private rt: RealtimeGateway
  ) {}

  async execute(input: BootstrapInput) {
    const limit = Math.max(1, Math.min(input.limit ?? 200, 500));
    let list;

    if (input.panelRole === "ADMIN") {
      list = await this.repo.listRecent(limit);
    } else {
      const userProjects = await this.projectRepo.findProjectsByUser(input.panelUserId, "APPROVED");
      const projectIds = userProjects.map(p => p.projectId);
      list = projectIds.length > 0
        ? await this.repo.listByProjects(projectIds, limit)
        : [];
    }

    this.rt.emitAdminBootstrap(input.socketId, list);

    return { ok: true as const, count: list.length };
  }
}
