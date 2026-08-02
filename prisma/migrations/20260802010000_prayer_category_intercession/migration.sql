-- CreateEnum
CREATE TYPE "PrayerCategory" AS ENUM ('PROTECTION', 'SALUT', 'GUERISON', 'DELIVRANCE', 'AUTRE');

-- AlterTable
ALTER TABLE "prayer_requests" ADD COLUMN "category" "PrayerCategory" NOT NULL DEFAULT 'AUTRE';

CREATE INDEX "prayer_requests_category_idx" ON "prayer_requests"("category");

-- CreateTable
CREATE TABLE "prayer_intercessions" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "intercessorId" TEXT,
    "intercessorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_intercessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prayer_intercessions_prayerRequestId_idx" ON "prayer_intercessions"("prayerRequestId");

ALTER TABLE "prayer_intercessions" ADD CONSTRAINT "prayer_intercessions_prayerRequestId_fkey"
  FOREIGN KEY ("prayerRequestId") REFERENCES "prayer_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "prayer_intercessions" ADD CONSTRAINT "prayer_intercessions_intercessorId_fkey"
  FOREIGN KEY ("intercessorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
