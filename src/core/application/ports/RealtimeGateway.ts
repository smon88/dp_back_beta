import { type Session } from "./SessionRepository.js";

export interface RealtimeGateway {
  emitSessionUpdate(sessionId: string, session: Session): void;
  emitAdminUpsert(session: Session): void;
  emitAdminBootstrap(socketId: string, list: Session[]): void; // opcional
}