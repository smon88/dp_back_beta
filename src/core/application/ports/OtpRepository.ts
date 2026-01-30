export type OtpCode = {
  id: string;
  panelUserId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type OtpCodeCreate = {
  panelUserId: string;
  codeHash: string;
  expiresAt: Date;
};

export interface OtpRepository {
  create(data: OtpCodeCreate): Promise<OtpCode>;
  findValidByUserId(panelUserId: string): Promise<OtpCode | null>;
  markAsUsed(id: string): Promise<OtpCode>;
  deleteExpired(): Promise<number>;
}
