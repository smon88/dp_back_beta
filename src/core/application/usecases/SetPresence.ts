import { SessionState } from "@prisma/client";
import type { SessionRepository } from "../ports/SessionRepository.js";
import type { RealtimeGateway } from "../ports/RealtimeGateway.js";

export class SetPresence {
  constructor(private repo: SessionRepository, private rt: RealtimeGateway) {}

  async execute(input: { sessionId: string; state: SessionState }) {
    const sessionId = (input.sessionId || "").trim();
    if (!sessionId) return { ok: false as const, error: "missing_sessionId" };

    const s = await this.repo.findById(sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    // Evita writes innecesarios
    if (s.state === input.state) {
      return { ok: true as const, session: s };
    }

    const updated = await this.repo.update(sessionId, { state: input.state });

    // sincroniza a user + admins
    this.rt.emitSessionUpdate(sessionId, updated);
    this.rt.emitAdminUpsert(updated);

    return { ok: true as const, session: updated };
  }
}
