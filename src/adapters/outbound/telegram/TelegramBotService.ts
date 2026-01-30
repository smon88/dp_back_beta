import type { TelegramGateway } from "../../../core/application/ports/TelegramGateway.js";

export class TelegramBotService implements TelegramGateway {
  private baseUrl: string;

  constructor(private botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(chatId: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error("Error sending Telegram message:", error);
      return false;
    }
  }

  async sendOtp(chatId: string, code: string): Promise<boolean> {
    const message = `<b>Codigo de verificacion</b>\n\nTu codigo OTP es: <code>${code}</code>\n\nExpira en 5 minutos.`;
    return this.sendMessage(chatId, message);
  }
}
