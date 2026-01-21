export interface PresenceTimer {
  schedule(sessionId: string, delayMs: number, fn: () => Promise<void>): void;
  cancel(sessionId: string): void;
}
