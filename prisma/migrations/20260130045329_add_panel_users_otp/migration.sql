/*
  Warnings:

  - You are about to drop the column `assignedAdminId` on the `Session` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PanelRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "assignedAdminId",
ADD COLUMN     "assignedUserId" TEXT;

-- CreateTable
CREATE TABLE "PanelUser" (
    "id" TEXT NOT NULL,
    "laravelId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "alias" TEXT,
    "tgChatId" TEXT,
    "tgUsername" TEXT,
    "role" "PanelRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "panelUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PanelUser_laravelId_key" ON "PanelUser"("laravelId");

-- CreateIndex
CREATE UNIQUE INDEX "PanelUser_username_key" ON "PanelUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PanelUser_tgChatId_key" ON "PanelUser"("tgChatId");

-- CreateIndex
CREATE INDEX "PanelUser_username_idx" ON "PanelUser"("username");

-- CreateIndex
CREATE INDEX "PanelUser_laravelId_idx" ON "PanelUser"("laravelId");

-- CreateIndex
CREATE INDEX "PanelUser_tgChatId_idx" ON "PanelUser"("tgChatId");

-- CreateIndex
CREATE INDEX "OtpCode_panelUserId_idx" ON "OtpCode"("panelUserId");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_assignedUserId_idx" ON "Session"("assignedUserId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "PanelUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_panelUserId_fkey" FOREIGN KEY ("panelUserId") REFERENCES "PanelUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
