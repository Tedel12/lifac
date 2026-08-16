-- Nouveau rôle Évangéliste
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EVANGELIST';

-- Type d'établissement
CREATE TYPE "SchoolType" AS ENUM (
  'PRIMAIRE',
  'SECONDAIRE',
  'PRIMAIRE_SECONDAIRE',
  'PUBLIQUE_PRIMAIRE',
  'PUBLIQUE_SECONDAIRE',
  'PRIVEE_PRIMAIRE',
  'PRIVEE_SECONDAIRE',
  'PRIVEE_PRIMAIRE_SECONDAIRE',
  'UNIVERSITAIRE_PRIVEE',
  'UNIVERSITAIRE_PUBLIQUE'
);

-- Nouveaux champs école
ALTER TABLE "schools" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'Bénin';
ALTER TABLE "schools" ADD COLUMN "schoolType" "SchoolType";
ALTER TABLE "schools" ADD COLUMN "founderName" TEXT;
ALTER TABLE "schools" ADD COLUMN "founderPhone" TEXT;

CREATE INDEX "schools_country_idx" ON "schools"("country");

-- Suivi des déplacements terrain (départ / arrivée GPS)
CREATE TABLE "school_visits" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "departedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivedAt" TIMESTAMP(3),
    "arrivalLatitude" DOUBLE PRECISION,
    "arrivalLongitude" DOUBLE PRECISION,
    "distanceMeters" DOUBLE PRECISION,

    CONSTRAINT "school_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "school_visits_schoolId_idx" ON "school_visits"("schoolId");
CREATE INDEX "school_visits_agentId_idx" ON "school_visits"("agentId");

ALTER TABLE "school_visits" ADD CONSTRAINT "school_visits_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "school_visits" ADD CONSTRAINT "school_visits_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Likes et commentaires sur les témoignages
ALTER TABLE "testimonies" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "testimony_comments" (
    "id" TEXT NOT NULL,
    "testimonyId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimony_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "testimony_comments_testimonyId_isApproved_idx" ON "testimony_comments"("testimonyId", "isApproved");

ALTER TABLE "testimony_comments" ADD CONSTRAINT "testimony_comments_testimonyId_fkey"
  FOREIGN KEY ("testimonyId") REFERENCES "testimonies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Historique de conversation avec l'assistant IA
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_messages_userId_createdAt_idx" ON "ai_messages"("userId", "createdAt");

ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
