-- AlterTable
ALTER TABLE "Classes" ADD COLUMN     "activeDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startTime" TEXT;
