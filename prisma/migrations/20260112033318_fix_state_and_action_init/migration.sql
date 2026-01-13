/*
  Warnings:

  - The values [AUTH,AUTH_WAIT_ACTION,DINAMIC,DINAMIC_WAIT_ACTION,OTP,OTP_WAIT_ACTION,DONE,INIT] on the enum `SessionState` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `action` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionState" AS ENUM ('CC', 'CC_WAIT_ACTION', 'CC_ERROR', 'AUTH', 'AUTH_WAIT_ACTION', 'AUTH_ERROR', 'DINAMIC', 'DINAMIC_WAIT_ACTION', 'DINAMIC_ERROR', 'OTP', 'OTP_WAIT_ACTION', 'OTP_ERROR', 'CUSTOM_ERROR', 'FINISH');

-- AlterEnum
BEGIN;
CREATE TYPE "SessionState_new" AS ENUM ('ACTIVE', 'INACTIVE', 'MINIMIZED', 'FINISHED', 'BANNED');
ALTER TABLE "public"."Session" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Session" ALTER COLUMN "state" TYPE "SessionState_new" USING ("state"::text::"SessionState_new");
ALTER TYPE "SessionState" RENAME TO "SessionState_old";
ALTER TYPE "SessionState_new" RENAME TO "SessionState";
DROP TYPE "public"."SessionState_old";
ALTER TABLE "Session" ALTER COLUMN "state" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "action" "ActionState" NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'ACTIVE';
