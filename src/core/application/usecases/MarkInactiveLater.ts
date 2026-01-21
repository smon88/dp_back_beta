import { SessionState } from "@prisma/client";
import type { PresenceTimer } from "../ports/PresenceTimer.js";
import { SetPresence } from "./SetPresence.js";

export class MarkInactiveLater {
  constructor(private timer: PresenceTimer, private setPresence: SetPresence) {}

  schedule(input: { sessionId: string; delayMs: number }) {
    const sessionId = (input.sessionId || "").trim();
    if (!sessionId) return;

    this.timer.schedule(sessionId, input.delayMs, async () => {
      await this.setPresence.execute({ sessionId, state: SessionState.INACTIVE });
    });
  }

  cancel(input: { sessionId: string }) {
    const sessionId = (input.sessionId || "").trim();
    if (!sessionId) return;
    this.timer.cancel(sessionId);
  }
}
