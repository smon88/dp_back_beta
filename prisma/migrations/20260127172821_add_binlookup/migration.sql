-- CreateTable
CREATE TABLE "binlookup" (
    "id" TEXT NOT NULL,
    "bin" VARCHAR(6) NOT NULL,
    "scheme" VARCHAR(32),
    "brand" VARCHAR(64),
    "type" VARCHAR(16),
    "level" VARCHAR(32),
    "bank" VARCHAR(128),
    "bankPhone" VARCHAR(64),
    "country" VARCHAR(2),
    "source" VARCHAR(32),
    "fetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "binlookup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "binlookup_bin_key" ON "binlookup"("bin");

-- CreateIndex
CREATE INDEX "binlookup_bank_idx" ON "binlookup"("bank");

-- CreateIndex
CREATE INDEX "binlookup_scheme_idx" ON "binlookup"("scheme");
