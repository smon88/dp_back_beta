// src/adapters/outbound/bin/ThirdPartyBinClient.ts
import type { BinLookupRemotePort, RemoteBinMeta } from "../../../core/application/ports/BinLookupRemotePort.js";

export class ThirdPartyBinClient implements BinLookupRemotePort {
  constructor(private apiKey: string, private baseUrl: string) {}

  async lookup(bin: string): Promise<RemoteBinMeta | null> {
    // OJO: aquí adaptas a la respuesta real del proveedor
    const res = await fetch(`https://lookup.binlist.net//${bin}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) return null;
    const j: any = await res.json();

    return {
      scheme: j.scheme ?? null,
      brand: j.brand ?? null,
      type: j.type ?? null,
      level: j.level ?? null,
      bank: j.bank?.name ?? null,
      bankPhone: j.bank?.phone ?? null,
      country: j.country?.alpha2 ?? null,
    };
  }
}
