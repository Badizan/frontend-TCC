/*
  Warnings:

  - You are about to alter the column `mileage` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `mileage` on the `MileageRecord` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `dueMileage` on the `Reminder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `intervalMileage` on the `Reminder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `mileage` on the `vehicles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "mileage" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "MileageRecord" ALTER COLUMN "mileage" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Reminder" ALTER COLUMN "dueMileage" SET DATA TYPE INTEGER,
ALTER COLUMN "intervalMileage" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "fipeBrandCode" TEXT,
ADD COLUMN     "fipeModelCode" TEXT,
ADD COLUMN     "fipeYearCode" TEXT,
ALTER COLUMN "mileage" SET DATA TYPE INTEGER;
