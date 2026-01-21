import { Socket } from "socket.io";
import { SessionState } from "@prisma/client";
import { SetPresence } from "../../../../core/application/usecases/SetPresence.js";
import { MarkInactiveLater } from "../../../../core/application/usecases/MarkInactiveLater.js";

export function registerPresenceHandlers(
  socket: Socket,
  deps: {
    setPresence: SetPresence;
    markInactiveLater: MarkInactiveLater;
    inactiveDelayMs?: number;
  }
) {
  const inactiveDelayMs = deps.inactiveDelayMs ?? 8000;

  // ✅ al conectar: cancelar INACTIVE y marcar ACTIVE
  const sessionId = socket.data.auth.sessionId;

  deps.markInactiveLater.cancel({ sessionId });
  deps.setPresence.execute({ sessionId, state: SessionState.ACTIVE }).catch(console.error);

  // ✅ evento del front: ACTIVE / MINIMIZED
  socket.on("user:presence", async (payload: { state: SessionState }) => {
    try {
      if (socket.data.auth?.role !== "user") return;
      const state = payload?.state;
      if (state !== SessionState.ACTIVE && state !== SessionState.MINIMIZED) return;

      await deps.setPresence.execute({ sessionId, state });
    } catch (e) {
      console.error("user:presence error", e);
    }
  });

  // ✅ al desconectar: programa INACTIVE (si reconecta rápido, se cancela arriba)
  socket.on("disconnect", () => {
    deps.markInactiveLater.schedule({ sessionId, delayMs: inactiveDelayMs });
  });
}
