/*
  Warnings:

  - You are about to drop the column `code` on the `encryptions` table. All the data in the column will be lost.
  - You are about to drop the column `frequencies` on the `encryptions` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `encryptions` table. All the data in the column will be lost.
  - Added the required column `code_back` to the `encryptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_front` to the `encryptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequencies_back` to the `encryptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequencies_front` to the `encryptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length_back` to the `encryptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length_front` to the `encryptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "encryptions" DROP COLUMN "code",
DROP COLUMN "frequencies",
DROP COLUMN "length",
ADD COLUMN     "code_back" TEXT NOT NULL,
ADD COLUMN     "code_front" TEXT NOT NULL,
ADD COLUMN     "frequencies_back" JSONB NOT NULL,
ADD COLUMN     "frequencies_front" JSONB NOT NULL,
ADD COLUMN     "length_back" INTEGER NOT NULL,
ADD COLUMN     "length_front" INTEGER NOT NULL;
