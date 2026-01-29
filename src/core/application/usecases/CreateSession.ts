import { ActionState, SessionState } from "@prisma/client";
import { type SessionRepository } from "../ports/SessionRepository.js";
import { type TokenService } from "../ports/TokenService.js";
import { type RealtimeGateway } from "../ports/RealtimeGateway.js";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export class CreateSession {
  constructor(
    private repo: SessionRepository,
    private tokens: TokenService,
    private rt: RealtimeGateway
  ) {}

  async execute(input: any) {
    // regla que ya tenías: si llega user/pass, arrancas en WAIT_ACTION

    const data = {
      ...input,
      action: input?.action ?? ActionState.DATA,
      state: input?.state ?? SessionState.ACTIVE,
      url: input?.url ?? null,
      lastError: null,
    };

    const session = await this.repo.create(data);
    const sessionToken = this.tokens.signUser(session.id);

    // avisar a admins
    this.rt.emitAdminUpsert(session);

    return { sessionId: session.id, sessionToken, session };
  }
}