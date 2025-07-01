/*
  Warnings:

  - The values [PUSH,SMS] on the enum `NotificationChannel` will be removed. If these variants are still used in the database, this will fail.
  - The values [MECHANIC,RECEPTIONIST] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `enablePushNotifications` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `enableSMSNotifications` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the `mileage_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `predictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationChannel_new" AS ENUM ('IN_APP', 'EMAIL');
ALTER TABLE "notifications" ALTER COLUMN "channel" TYPE "NotificationChannel_new" USING ("channel"::text::"NotificationChannel_new");
ALTER TYPE "NotificationChannel" RENAME TO "NotificationChannel_old";
ALTER TYPE "NotificationChannel_new" RENAME TO "NotificationChannel";
DROP TYPE "NotificationChannel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'OWNER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'OWNER';
COMMIT;

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_mechanicId_fkey";

-- DropForeignKey
ALTER TABLE "mileage_records" DROP CONSTRAINT "mileage_records_vehicleId_fkey";

-- DropIndex
DROP INDEX "vehicles_licensePlate_key";

-- AlterTable
ALTER TABLE "maintenances" ALTER COLUMN "mechanicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "createdAt",
DROP COLUMN "enablePushNotifications",
DROP COLUMN "enableSMSNotifications",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- DropTable
DROP TABLE "mileage_records";

-- DropTable
DROP TABLE "predictions";

-- DropTable
DROP TABLE "reports";

-- CreateTable
CREATE TABLE "MileageRecord" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MileageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prediction" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MileageRecord" ADD CONSTRAINT "MileageRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
