-- Étend l'enum ActivityType avec les nouveaux types d'activités demandés par le client :
-- YOUTH_CRUSADE, HUMANITARIAN, TRAINING.
-- ALTER TYPE ... ADD VALUE ne peut pas s'exécuter dans une transaction avec d'autres
-- opérations sur ce même type ; chaque valeur est donc ajoutée séparément.
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'YOUTH_CRUSADE' BEFORE 'POP_UP_CRUSADE';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'HUMANITARIAN';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'TRAINING';