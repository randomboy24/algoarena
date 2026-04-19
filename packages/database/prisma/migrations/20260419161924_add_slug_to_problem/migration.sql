-- AlterTable: Add slug column with default value using title
ALTER TABLE "Problem" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Update existing records: convert title to slug (lowercase, replace spaces with hyphens)
UPDATE "Problem" SET "slug" = LOWER(REGEXP_REPLACE("title", '\s+', '-', 'g'));

-- Make slug unique
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_slug_key" UNIQUE ("slug");
