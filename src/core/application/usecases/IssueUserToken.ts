import { type SessionRepository } from "../ports/SessionRepository.js";
import { type TokenService } from "../ports/TokenService.js";

export class IssueUserToken {
  constructor(private repo: SessionRepository, private tokens: TokenService) {}

  async execute(input: { sessionId: string }) {
  const sessionId = (input.sessionId || "").trim();
    if (!sessionId) return { ok: false as const, error: "missing_sessionId" };

    const s = await this.repo.findById(sessionId);
    if (!s) return { ok: false as const, error: "not_found" };

    const sessionToken = this.tokens.signUser(sessionId);
    return { ok: true as const, sessionId, sessionToken };
  }
}