/*
  Warnings:

  - You are about to drop the `AppSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SignatureLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnsentQueue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TYPES" AS ENUM ('OFFICE', 'MEMORANDUM');

-- CreateEnum
CREATE TYPE "CATEGORY" AS ENUM ('NORMAL', 'ENCRYPTED');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('DRAFT', 'NOT_SENT', 'SENT');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_parentDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRecipient" DROP CONSTRAINT "DocumentRecipient_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRecipient" DROP CONSTRAINT "DocumentRecipient_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "SignatureLog" DROP CONSTRAINT "SignatureLog_documentId_fkey";

-- DropForeignKey
ALTER TABLE "SignatureLog" DROP CONSTRAINT "SignatureLog_signerId_fkey";

-- DropForeignKey
ALTER TABLE "UnsentQueue" DROP CONSTRAINT "UnsentQueue_documentId_fkey";

-- DropTable
DROP TABLE "AppSettings";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentRecipient";

-- DropTable
DROP TABLE "SignatureLog";

-- DropTable
DROP TABLE "UnsentQueue";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "DocumentCategory";

-- DropEnum
DROP TYPE "DocumentStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "StorageLocation";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "lastname" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "parent_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docs" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "url" TEXT,
    "password" TEXT,
    "type" "TYPES",
    "category" "CATEGORY",

    CONSTRAINT "docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryptions" (
    "id" SERIAL NOT NULL,
    "id_doc" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "frequencies" JSONB NOT NULL,

    CONSTRAINT "encryptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sends" (
    "id" SERIAL NOT NULL,
    "id_emisor" INTEGER NOT NULL,
    "id_receptor" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,
    "reading" BOOLEAN,
    "writing" BOOLEAN,

    CONSTRAINT "sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "id_send" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creations" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,
    "status" "STATUS",
    "details" TEXT,

    CONSTRAINT "creations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encryptions" ADD CONSTRAINT "encryptions_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sends" ADD CONSTRAINT "sends_id_emisor_fkey" FOREIGN KEY ("id_emisor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sends" ADD CONSTRAINT "sends_id_receptor_fkey" FOREIGN KEY ("id_receptor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sends" ADD CONSTRAINT "sends_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_id_send_fkey" FOREIGN KEY ("id_send") REFERENCES "sends"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
