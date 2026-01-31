import { type Session } from "./SessionRepository.js";

export type PanelUserStatus = {
  odId: string;
  username: string;
  alias?: string | null;
  role: string;
  isOnline: boolean;
};

export type ProjectMembershipUpdate = {
  projectId: string;
  projectName: string;
  status: "APPROVED" | "REJECTED" | "REMOVED";
};

export interface RealtimeGateway {
  emitSessionUpdate(sessionId: string, session: Session): void;
  emitAdminUpsert(session: Session): void;
  emitAdminBootstrap(socketId: string, list: Session[]): void;

  // Panel user socket registration (for direct messages)
  registerPanelUser(panelUserId: string, socketId: string): void;
  unregisterPanelUser(panelUserId: string): void;

  // Panel user presence
  emitPanelUserOnline(user: PanelUserStatus): void;
  emitPanelUserOffline(odId: string): void;

  // Project membership updates (to specific user)
  emitProjectMembershipUpdate(panelUserId: string, update: ProjectMembershipUpdate): void;

  // Join user to project room (when approved) - uses panelUserId to find socket
  joinProjectRoom(panelUserId: string, projectId: string): void;
}