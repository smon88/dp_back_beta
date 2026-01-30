import crypto from "crypto";
import type { PanelUserRepository } from "../../ports/PanelUserRepository.js";
import type { OtpRepository } from "../../ports/OtpRepository.js";
import type { TokenService } from "../../ports/TokenService.js";

type VerifyOtpInput = {
  laravelId: number;
  otp: string;
};

export class VerifyOtp {
  constructor(
    private panelUserRepo: PanelUserRepository,
    private otpRepo: OtpRepository,
    private tokenService: TokenService,
    private sharedSecret: string
  ) {}

  async execute(input: VerifyOtpInput, providedSecret: string | undefined) {
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

    // Buscar OTP válido
    const otpCode = await this.otpRepo.findValidByUserId(panelUser.id);
    if (!otpCode) {
      return { ok: false as const, error: "otp_expired_or_not_found" };
    }

    // Verificar hash
    const inputHash = crypto.createHash("sha256").update(input.otp).digest("hex");
    if (inputHash !== otpCode.codeHash) {
      return { ok: false as const, error: "invalid_otp" };
    }

    // Marcar como usado
    await this.otpRepo.markAsUsed(otpCode.id);

    // Actualizar último login
    await this.panelUserRepo.update(panelUser.id, {
      lastLoginAt: new Date(),
    });

    // Generar JWT para WebSocket
    const token = this.tokenService.signAdmin(panelUser.id);

    return {
      ok: true as const,
      panelUser: {
        id: panelUser.id,
        username: panelUser.username,
        role: panelUser.role,
      },
      token,
    };
  }
}
