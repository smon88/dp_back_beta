export interface TelegramGateway {
  sendMessage(chatId: string, text: string): Promise<boolean>;
  sendOtp(chatId: string, code: string): Promise<boolean>;
}
