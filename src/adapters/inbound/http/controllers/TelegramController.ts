import { type Request, type Response } from "express";
import { HandleTelegramUpdate } from "../../../../core/application/usecases/panelUser/HandleTelegramUpdate.js";

export class TelegramController {
  constructor(
    private handleTelegramUpdate: HandleTelegramUpdate,
    private webhookSecret?: string
  ) {}

  webhook = async (req: Request, res: Response) => {
    // Validar webhook secret si está configurado
    if (this.webhookSecret) {
      const providedSecret = req.header("X-Telegram-Bot-Api-Secret-Token");
      if (providedSecret !== this.webhookSecret) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    try {
      await this.handleTelegramUpdate.execute(req.body);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error handling Telegram update:", error);
      res.json({ ok: true }); // Siempre retornar ok para evitar reintentos de Telegram
    }
  };
}
