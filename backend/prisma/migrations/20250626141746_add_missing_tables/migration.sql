-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MAINTENANCE_DUE', 'REMINDER_DUE', 'MILEAGE_ALERT', 'EXPENSE_LIMIT', 'SYSTEM_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('TIME_BASED', 'MILEAGE_BASED', 'HYBRID');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "mileage" INTEGER;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "dueMileage" INTEGER,
ADD COLUMN     "intervalDays" INTEGER,
ADD COLUMN     "intervalMileage" INTEGER,
ADD COLUMN     "lastNotified" TIMESTAMP(3),
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ReminderType" NOT NULL DEFAULT 'TIME_BASED',
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "color" TEXT,
ADD COLUMN     "mileage" INTEGER;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enablePushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSMSNotifications" BOOLEAN NOT NULL DEFAULT false,
    "defaultReminderDays" INTEGER NOT NULL DEFAULT 7,
    "defaultReminderMileage" INTEGER NOT NULL DEFAULT 5000,
    "maintenanceReminderAdvance" INTEGER NOT NULL DEFAULT 7,
    "defaultReportPeriod" TEXT NOT NULL DEFAULT 'monthly',
    "expenseAlertLimit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mileage_records" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mileage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "vehicleId" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prediction" JSONB NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mileage_records" ADD CONSTRAINT "mileage_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
