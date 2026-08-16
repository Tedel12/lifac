ALTER TABLE "activities" ADD COLUMN "schoolId" TEXT;

CREATE INDEX "activities_schoolId_idx" ON "activities"("schoolId");

ALTER TABLE "activities" ADD CONSTRAINT "activities_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
