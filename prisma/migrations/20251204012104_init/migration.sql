/*
  Warnings:

  - You are about to drop the column `creatorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_creatorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "creatorId",
DROP COLUMN "password";
