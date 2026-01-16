import { Server } from "socket.io";
import { type RealtimeGateway } from "../../../core/application/ports/RealtimeGateway.js";
import { type Session } from "../../../core/application/ports/SessionRepository.js";

export class SocketIoGateway implements RealtimeGateway {
  constructor(private io: Server) {}

  emitSessionUpdate(sessionId: string, session: Session) {
    this.io.to(`session:${sessionId}`).emit("session:update", session);
  }

  emitAdminUpsert(session: Session) {
    this.io.to("admins").emit("admin:sessions:upsert", session);
  }

  emitAdminBootstrap(socketId: string, list: Session[]) {
    this.io.to(socketId).emit("admin:sessions:bootstrap", list);
  }
}