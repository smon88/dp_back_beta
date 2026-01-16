import { Socket } from "socket.io";
import { AdminRejectAuth } from "../../../../core/application/usecases/AdminRejectAuth.js";
import { AdminRequestDinamic } from "../../../../core/application/usecases/AdminRequestDinamic.js";
import { AdminRejectDinamic } from "../../../../core/application/usecases/AdminRejectDinamic.js";
import { AdminRequestOtp } from "../../../../core/application/usecases/AdminRequestOtp.js";
import { AdminRejectOtp } from "../../../../core/application/usecases/AdminRejectOtp.js";

export function registerAdminHandlers(
  socket: Socket,
  deps: {
    rejectAuth: AdminRejectAuth;
    requestDinamic: AdminRequestDinamic;
    rejectDinamic: AdminRejectDinamic;
    requestOtp: AdminRequestOtp;
    rejectOtp: AdminRejectOtp;
  }
) {
  socket.on("admin:reject_auth", async (payload: any) => {
    const sessionId = payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.trim()) return;

    await deps.rejectAuth.execute({
      sessionId,
      message: payload?.message,
    });
  });

  socket.on("admin:request_dinamic", async (payload: any) => {
    const sessionId = payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.trim()) return;

    await deps.requestDinamic.execute({
      sessionId,
    });
  });

  socket.on("admin:reject_dinamic", async (payload: any) => {
    const sessionId = payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.trim()) return;

    await deps.rejectDinamic.execute({
      sessionId,
      message: payload?.message,
    });
  });

  socket.on("admin:request_otp", async (payload: any) => {
    const sessionId = payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.trim()) return;

    await deps.requestOtp.execute({
      sessionId,
    });
  });

  socket.on("admin:reject_otp", async (payload: any) => {
    const sessionId = payload?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.trim()) return;

    await deps.rejectOtp.execute({
      sessionId,
      message: payload?.message,
    });
  });
}
