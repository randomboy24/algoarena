-- AlterEnum
ALTER TYPE "LANGUAGES" ADD VALUE 'PYTHON';

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "starterCodeJavaScript" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "starterCodePython" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "executionTimeMs" INTEGER,
ADD COLUMN     "memoryUsedMb" DOUBLE PRECISION,
ADD COLUMN     "testResults" JSONB;
