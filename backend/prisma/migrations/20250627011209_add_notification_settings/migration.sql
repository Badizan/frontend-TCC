/*
  Warnings:

  - You are about to drop the column `defaultReminderDays` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultReminderMileage` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultReportPeriod` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `enableEmailNotifications` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `expenseAlertLimit` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceReminderAdvance` on the `user_settings` table. All the data in the column will be lost.
  - Added the required column `category` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "defaultReminderDays",
DROP COLUMN "defaultReminderMileage",
DROP COLUMN "defaultReportPeriod",
DROP COLUMN "enableEmailNotifications",
DROP COLUMN "expenseAlertLimit",
DROP COLUMN "maintenanceReminderAdvance",
ADD COLUMN     "advancedSettings" JSONB NOT NULL DEFAULT '{"maintenanceReminderDays": 7, "mileageAlertThreshold": 1000, "monthlyExpenseLimit": null}',
ADD COLUMN     "categories" JSONB NOT NULL DEFAULT '{"maintenance": {"inApp": true, "email": true}, "expenses": {"inApp": true, "email": true}, "reminders": {"inApp": true, "email": true}, "system": {"inApp": true, "email": false}}',
ADD COLUMN     "channels" JSONB NOT NULL DEFAULT '{"inApp": true, "email": true}';
