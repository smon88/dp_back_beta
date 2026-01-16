export type AuthPayload =
  | { role: "admin"; adminId: string; email?: string }
  | { role: "user"; sessionId: string };

export interface TokenService {
  signUser(sessionId: string): string;
  signAdmin(adminId: string): string;
  verify(token: string): AuthPayload;
}