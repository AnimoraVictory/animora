/*
  Warnings:

  - Added the required column `imageUrl` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "imageUrl" TEXT NOT NULL;
