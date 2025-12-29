/*
  Warnings:

  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "TaskShare" DROP CONSTRAINT "TaskShare_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskShare" DROP CONSTRAINT "TaskShare_userId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Task_ownerId_idx" ON "Task"("ownerId");

-- CreateIndex
CREATE INDEX "TaskShare_userId_idx" ON "TaskShare"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
