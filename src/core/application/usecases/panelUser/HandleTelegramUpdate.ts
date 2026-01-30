import type { PanelUserRepository } from "../../ports/PanelUserRepository.js";
import type { TelegramGateway } from "../../ports/TelegramGateway.js";

type TelegramMessage = {
  chat: {
    id: number;
    username?: string;
  };
  text?: string;
};

type TelegramUpdate = {
  message?: TelegramMessage;
};

export class HandleTelegramUpdate {
  constructor(
    private panelUserRepo: PanelUserRepository,
    private telegram: TelegramGateway
  ) {}

  async execute(update: TelegramUpdate) {
    const message = update.message;
    if (!message || !message.text) {
      return { ok: true as const, action: "ignored" };
    }

    const chatId = message.chat.id.toString();
    const username = message.chat.username;
    const text = message.text.trim();

    // Comando /start para vincular cuenta
    if (text === "/start") {
      return this.handleStart(chatId, username);
    }

    return { ok: true as const, action: "ignored" };
  }

  private async handleStart(chatId: string, username?: string) {
    if (!username) {
      await this.telegram.sendMessage(
        chatId,
        "No tienes un username de Telegram configurado. Por favor configura uno en los ajustes de Telegram."
      );
      return { ok: false as const, error: "no_telegram_username" };
    }

    // Buscar usuario por tgUsername
    const panelUser = await this.panelUserRepo.findByTgUsername(username);
    if (!panelUser) {
      await this.telegram.sendMessage(
        chatId,
        `No se encontro una cuenta asociada a @${username}. Contacta al administrador.`
      );
      return { ok: false as const, error: "user_not_found" };
    }

    // Verificar si ya está vinculado
    if (panelUser.tgChatId) {
      await this.telegram.sendMessage(
        chatId,
        `Tu cuenta ya esta vinculada. Recibiras los codigos OTP aqui.`
      );
      return { ok: true as const, action: "already_linked" };
    }

    // Vincular
    await this.panelUserRepo.update(panelUser.id, { tgChatId: chatId });

    await this.telegram.sendMessage(
      chatId,
      `Cuenta vinculada exitosamente.\n\nUsuario: ${panelUser.username}\nRol: ${panelUser.role}\n\nRecibiras los codigos OTP en este chat.`
    );

    return {
      ok: true as const,
      action: "linked",
      panelUserId: panelUser.id,
    };
  }
}
