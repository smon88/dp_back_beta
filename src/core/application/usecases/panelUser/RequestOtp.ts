import crypto from "crypto";
import type { PanelUserRepository } from "../../ports/PanelUserRepository.js";
import type { OtpRepository } from "../../ports/OtpRepository.js";
import type { TelegramGateway } from "../../ports/TelegramGateway.js";

type RequestOtpInput = {
  laravelId: number;
};

export class RequestOtp {
  private otpLength: number;
  private otpExpirySeconds: number;

  constructor(
    private panelUserRepo: PanelUserRepository,
    private otpRepo: OtpRepository,
    private telegram: TelegramGateway,
    private sharedSecret: string,
    options?: { otpLength?: number; otpExpirySeconds?: number }
  ) {
    this.otpLength = options?.otpLength || 6;
    this.otpExpirySeconds = options?.otpExpirySeconds || 300;
  }

  async execute(input: RequestOtpInput, providedSecret: string | undefined) {
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return { ok: false as const, error: "unauthorized" };
    }

    const panelUser = await this.panelUserRepo.findByLaravelId(input.laravelId);
    if (!panelUser) {
      return { ok: false as const, error: "user_not_found" };
    }

    if (!panelUser.isActive) {
      return { ok: false as const, error: "user_inactive" };
    }

    if (!panelUser.tgChatId) {
      return {
        ok: false as const,
        error: "telegram_not_linked",
        message: "Telegram no vinculado. El usuario debe enviar /start al bot.",
      };
    }

    // Generar código OTP de 6 dígitos
    const code = this.generateOtpCode();
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + this.otpExpirySeconds * 1000);

    // Guardar OTP
    await this.otpRepo.create({
      panelUserId: panelUser.id,
      codeHash,
      expiresAt,
    });

    // Enviar via Telegram
    const sent = await this.telegram.sendOtp(panelUser.tgChatId, code);
    if (!sent) {
      return { ok: false as const, error: "telegram_send_failed" };
    }

    return {
      ok: true as const,
      message: "OTP enviado",
      expiresIn: this.otpExpirySeconds,
    };
  }

  private generateOtpCode(): string {
    const max = Math.pow(10, this.otpLength);
    const min = Math.pow(10, this.otpLength - 1);
    const code = crypto.randomInt(min, max);
    return code.toString();
  }

  private hashCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
  }
}
