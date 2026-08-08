ALTER TABLE "schools" ADD COLUMN "createdById" TEXT;

CREATE INDEX "schools_createdById_idx" ON "schools"("createdById");

ALTER TABLE "schools" ADD CONSTRAINT "schools_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
