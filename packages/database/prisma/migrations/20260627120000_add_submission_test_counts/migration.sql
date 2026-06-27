-- Add explicit judge summary counts so failed submissions can report X/Y
-- even when execution stops at the first failing test case.
ALTER TABLE "Submission" ADD COLUMN "passedTestCount" INTEGER;
ALTER TABLE "Submission" ADD COLUMN "totalTestCount" INTEGER;
