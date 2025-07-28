/*
  Warnings:

  - You are about to drop the column `fipeBrandCode` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `fipeModelCode` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `fipeYearCode` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "fipeBrandCode",
DROP COLUMN "fipeModelCode",
DROP COLUMN "fipeYearCode",
ALTER COLUMN "mileage" SET DATA TYPE DOUBLE PRECISION;
