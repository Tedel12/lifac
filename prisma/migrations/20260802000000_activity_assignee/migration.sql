-- Ajoute la relation Activity -> User (missionnaire assigné), nécessaire pour que le
-- dashboard missionnaire puisse afficher "mes activités". `responsibleName` reste tel quel
-- pour l'affichage libre/legacy ; `assignedToId` devient la source de vérité relationnelle.
ALTER TABLE "activities" ADD COLUMN "assignedToId" TEXT;

ALTER TABLE "activities" ADD CONSTRAINT "activities_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "activities_assignedToId_idx" ON "activities"("assignedToId");
