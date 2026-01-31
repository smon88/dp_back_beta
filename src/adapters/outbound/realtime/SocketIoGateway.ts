import { Server } from "socket.io";
import { type RealtimeGateway, type PanelUserStatus, type ProjectMembershipUpdate } from "../../../core/application/ports/RealtimeGateway.js";
import { type Session } from "../../../core/application/ports/SessionRepository.js";

export class SocketIoGateway implements RealtimeGateway {
  // Mapeo de panelUserId -> socketId para mensajes directos
  private panelUserSockets = new Map<string, string>();

  constructor(private io: Server) {}

  // Registrar socket de panel user
  registerPanelUser(panelUserId: string, socketId: string) {
    this.panelUserSockets.set(panelUserId, socketId);
  }

  // Desregistrar socket de panel user
  unregisterPanelUser(panelUserId: string) {
    this.panelUserSockets.delete(panelUserId);
  }

  emitSessionUpdate(sessionId: string, session: Session) {
    this.io.to(`session:${sessionId}`).emit("session:update", session);
  }

  emitAdminUpsert(session: Session) {
    // Enviar a admins que ven todo
    this.io.to("admins:all").emit("admin:sessions:upsert", session);

    // Enviar a usuarios del proyecto específico (si tiene projectId)
    if (session.projectId) {
      this.io.to(`project:${session.projectId}`).emit("admin:sessions:upsert", session);
    }
  }

  emitAdminBootstrap(socketId: string, list: Session[]) {
    this.io.to(socketId).emit("admin:sessions:bootstrap", list);
  }

  // Panel user presence - notificar a admins
  emitPanelUserOnline(user: PanelUserStatus) {
    this.io.to("admins:all").emit("panel-user:online", user);
  }

  emitPanelUserOffline(odId: string) {
    this.io.to("admins:all").emit("panel-user:offline", { odId });
  }

  // Notificar a un usuario específico sobre cambio en su membresía
  emitProjectMembershipUpdate(panelUserId: string, update: ProjectMembershipUpdate) {
    const socketId = this.panelUserSockets.get(panelUserId);
    if (socketId) {
      this.io.to(socketId).emit("project:membership-update", update);
    }
  }

  // Unir socket a sala de proyecto (cuando se aprueba)
  joinProjectRoom(panelUserId: string, projectId: string) {
    const socketId = this.panelUserSockets.get(panelUserId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`project:${projectId}`);
      }
    }
  }
}