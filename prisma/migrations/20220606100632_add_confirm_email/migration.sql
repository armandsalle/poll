-- AlterTable
ALTER TABLE "User" ADD COLUMN     "confirmedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmedEmailAt" TIMESTAMP(3);
