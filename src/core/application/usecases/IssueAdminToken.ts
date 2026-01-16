import { type TokenService } from "../ports/TokenService.js";

export class IssueAdminToken {
  constructor(private tokens: TokenService, private sharedSecret: string) {}

  async execute(input: { providedSecret: string | undefined; adminId: string }) {
    if (!input.providedSecret || input.providedSecret !== this.sharedSecret) {
      return { ok: false as const, error: "unauthorized" };
    }

    const token = this.tokens.signAdmin(input.adminId || "");
    return { ok: true as const, token };
  }
}