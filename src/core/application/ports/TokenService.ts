export type AuthPayload =
  | { role: "admin"; panelUserId: string; panelRole: "ADMIN" | "USER" }
  | { role: "user"; sessionId: string };

export interface TokenService {
  signUser(sessionId: string): string;
  signPanelUser(panelUserId: string, panelRole: "ADMIN" | "USER"): string;
  verify(token: string): AuthPayload;
}