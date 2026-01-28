// src/core/ports/BinLookupRemotePort.ts
export type RemoteBinMeta = {
  scheme?: string | null;
  brand?: string | null;
  type?: string | null;
  level?: string | null;
  bank?: string | null;
  bankPhone?: string | null;
  country?: string | null;
  currency?: string | null;
};

export interface BinLookupRemotePort {
  lookup(bin: string): Promise<RemoteBinMeta | null>;
}