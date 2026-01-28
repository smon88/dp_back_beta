// src/core/ports/CardIntelligencePort.ts
export type CardMeta = {
  bin: string;        // "457562"
  brand: string;      // "visa" | "mc" | ...
  bank: string;// "Bancolombia"
  level: string;     // "platinum" | "gold" | ...
  type: string;  // "credit" | "debit" | ...
  country: string;   // "CO"
};

export interface CardIntelligencePort {
  identify(cardNumber: string): Promise<CardMeta>; 
}
