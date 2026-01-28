// src/core/services/BinLookupService.ts
import type { BinLookupRemotePort } from "../../../core/application/ports/BinLookupRemotePort.js";
import type { PrismaBinLookupRepository } from "../../outbound/db/PrismaBinLookupRepository.js";

export class BinLookupService {
  constructor(
    private repo: PrismaBinLookupRepository,
    private remote: BinLookupRemotePort
  ) {}

  async identifyByCardNumber(cardNumber: string) {
    const cc = (cardNumber || "").replace(/\D/g, "");
    const bin = cc.slice(0, 6);
    if (bin.length < 6) return null;

    // 1) DB first
    const cached = await this.repo.findByBin(bin);
    if (cached) return cached;

    // 2) Remote fallback
    const meta = await this.remote.lookup(bin);
    if (!meta) return null;

    // 3) Save in DB (cache)
    const saved = await this.repo.upsertByBin({
      bin,
      ...meta,
      source: "third_party",
      fetchedAt: new Date(),
    });

    return saved;
  }
}
