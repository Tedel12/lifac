ALTER TABLE "notifications" ADD COLUMN "targetUserId" TEXT;

CREATE INDEX "notifications_targetUserId_idx" ON "notifications"("targetUserId");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_targetUserId_fkey"
  FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
