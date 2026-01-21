import type { PresenceTimer } from "../../../core/application/ports/PresenceTimer.js";

export class NodePresenceTimer implements PresenceTimer {
  private timers = new Map<string, NodeJS.Timeout>();

  schedule(sessionId: string, delayMs: number, fn: () => Promise<void>) {
    this.cancel(sessionId);

    const t = setTimeout(async () => {
      this.timers.delete(sessionId);
      try {
        await fn();
      } catch (e) {
        console.error("PresenceTimer fn error:", e);
      }
    }, delayMs);

    this.timers.set(sessionId, t);
  }

  cancel(sessionId: string) {
    const t = this.timers.get(sessionId);
    if (t) clearTimeout(t);
    this.timers.delete(sessionId);
  }
}
