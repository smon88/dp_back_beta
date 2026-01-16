import type { SessionRepository } from "../ports/SessionRepository.js";
import type { RealtimeGateway } from "../ports/RealtimeGateway.js";

export class AdminBootstrap {
  constructor(
    private repo: SessionRepository,
    private rt: RealtimeGateway
  ) {}

  async execute(input: { socketId: string; limit?: number }) {
    const limit = Math.max(1, Math.min(input.limit ?? 200, 500)); // seguridad
    const list = await this.repo.listRecent(limit);

    this.rt.emitAdminBootstrap(input.socketId, list);

    return { ok: true as const, count: list.length };
  }
}
