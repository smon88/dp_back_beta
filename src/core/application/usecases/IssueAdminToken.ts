import { type TokenService } from "../ports/TokenService.js";

export class IssueAdminToken {
  constructor(private tokens: TokenService, private sharedSecret: string) {}

  async execute(input: { providedSecret: string | undefined; panelUserId: string; panelRole: "ADMIN" | "USER" }) {
    if (!input.providedSecret || input.providedSecret !== this.sharedSecret) {
      return { ok: false as const, error: "unauthorized" };
    }

    const token = this.tokens.signPanelUser(input.panelUserId, input.panelRole);
    return { ok: true as const, token };
  }
}