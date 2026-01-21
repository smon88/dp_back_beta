import { ActionState } from "@prisma/client";
import { type SessionRepository } from "../ports/SessionRepository.js";
import { type RealtimeGateway } from "../ports/RealtimeGateway.js";
import { SessionPolicy } from "../../domain/session/SessionPolicy.js";

export class AdminRejectData {
  constructor(private repo: SessionRepository, private rt: RealtimeGateway) {}

  async execute(input: { sessionId: string; message?: string }) {
    const sessionId = (input.sessionId || "").trim();
    if (!sessionId) return { ok: false as const, error: "missing_sessionId" };

    const s = await this.repo.findById(sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    if (!SessionPolicy.canAdminRejectData(s.action)) {
      return { ok: false as const, error: "bad_state" };
    }

    const updated = await this.repo.update(sessionId, {
      action: ActionState.DATA_ERROR,
      lastError: input.message?.trim() || "Datos inválidos. Verifica e intenta nuevamente.",
    });

    this.rt.emitSessionUpdate(sessionId, updated);
    this.rt.emitAdminUpsert(updated);

    return { ok: true as const };
  }
}
