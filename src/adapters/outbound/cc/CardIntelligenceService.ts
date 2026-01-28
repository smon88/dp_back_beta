// src/adapters/outbound/card/CardIntelligenceService.ts
import type { CardIntelligencePort, CardMeta } from "../../../core/application/ports/CardIntelligencePort.js";

export class CardIntelligenceService implements CardIntelligencePort {
  constructor(
    private readonly localRepo: { findByBin(bin: string): Promise<Partial<CardMeta> | null> },
    private readonly remoteClient?: { lookup(bin: string): Promise<Partial<CardMeta> | null> },
  ) {}

  async identify(cardNumber: string): Promise<CardMeta> {
    const clean = (cardNumber || "").replace(/\D/g, "");
    const bin = clean.slice(0, 6);

    if (bin.length < 6) {
      return { bin, brand: "unknown", bank: "unknow", level: "unknow", type: "unknow", country: "unknow" };
    }

    // 1) Local
    const local = await this.localRepo.findByBin(bin);
    if (local && local.brand && local.bank && local.level && local.type && local.country) return { bin, brand: local.brand, bank: local.bank, level: local.level, type: local.type, country: local.country };

    // 2) Remote (fallback)
    const remote = this.remoteClient ? await this.remoteClient.lookup(bin) : null;
    if (remote && remote.brand && remote.bank && remote.level && remote.type && remote.country) return { bin, brand: remote.brand, bank: remote.bank, level: remote.level, type: remote.type, country: remote.country  };

    return { bin, brand: "unknown", bank: "unknow", level: "unknow", type: "unknow", country: "unknow"  };
  }
}
