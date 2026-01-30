import { type Request, type Response } from "express";
import { SyncPanelUser } from "../../../../core/application/usecases/panelUser/SyncPanelUser.js";
import { RequestOtp } from "../../../../core/application/usecases/panelUser/RequestOtp.js";
import { VerifyOtp } from "../../../../core/application/usecases/panelUser/VerifyOtp.js";
import type { PanelUserRepository } from "../../../../core/application/ports/PanelUserRepository.js";

export class PanelUserController {
  constructor(
    private syncPanelUser: SyncPanelUser,
    private requestOtp: RequestOtp,
    private verifyOtp: VerifyOtp,
    private panelUserRepo?: PanelUserRepository,
    private sharedSecret?: string
  ) {}

  sync = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const { laravelId, username, alias, tgUsername, role, action } = req.body;

    if (!laravelId || !username || !role || !action) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    const result = await this.syncPanelUser.execute(
      { laravelId, username, alias, tgUsername, role, action },
      providedSecret
    );

    if (!result.ok) {
      const status = result.error === "unauthorized" ? 401 : 400;
      return res.status(status).json({ error: result.error });
    }

    res.json({ panelUser: result.panelUser });
  };

  requestOtpHandler = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const { laravelId } = req.body;

    if (!laravelId) {
      return res.status(400).json({ error: "missing_laravel_id" });
    }

    const result = await this.requestOtp.execute({ laravelId }, providedSecret);

    if (!result.ok) {
      const status = result.error === "unauthorized" ? 401 : 400;
      return res.status(status).json({
        error: result.error,
        message: "message" in result ? result.message : undefined,
      });
    }

    res.json({
      success: true,
      message: result.message,
      expiresIn: result.expiresIn,
    });
  };

  verifyOtpHandler = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const { laravelId, otp } = req.body;

    if (!laravelId || !otp) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    const result = await this.verifyOtp.execute({ laravelId, otp }, providedSecret);

    if (!result.ok) {
      const status = result.error === "unauthorized" ? 401 : 400;
      return res.status(status).json({ valid: false, error: result.error });
    }

    res.json({
      valid: true,
      panelUser: result.panelUser,
      token: result.token,
    });
  };

  // DEV: Vincular Telegram manualmente sin webhook
  linkTelegramManually = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    if (!this.sharedSecret || providedSecret !== this.sharedSecret) {
      return res.status(401).json({ error: "unauthorized" });
    }

    if (!this.panelUserRepo) {
      return res.status(500).json({ error: "not_configured" });
    }

    const { laravelId, tgChatId } = req.body;
    if (!laravelId || !tgChatId) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    const user = await this.panelUserRepo.findByLaravelId(laravelId);
    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

    await this.panelUserRepo.update(user.id, { tgChatId: String(tgChatId) });

    res.json({
      success: true,
      message: "Telegram vinculado manualmente",
      panelUser: { ...user, tgChatId },
    });
  };
}
