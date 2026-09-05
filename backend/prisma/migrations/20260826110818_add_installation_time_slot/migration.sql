-- CreateEnum
CREATE TYPE "InstallationTimeSlot" AS ENUM ('MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "InstallationRequest" ADD COLUMN     "timeSlot" "InstallationTimeSlot" DEFAULT 'MORNING';
