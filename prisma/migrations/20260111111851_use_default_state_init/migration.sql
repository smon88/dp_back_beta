-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "state" SET DEFAULT 'INIT';
UPDATE "Session" SET "state" = 'INIT' WHERE "state" IS NULL;
