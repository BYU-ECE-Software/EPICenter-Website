-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "datasheetURL" TEXT,
ADD COLUMN     "reorder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "receiptURL" TEXT;
