-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'EXPENSE_CREATED';

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "mileage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MileageRecord" ALTER COLUMN "mileage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Reminder" ALTER COLUMN "dueMileage" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "intervalMileage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "mileage" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
