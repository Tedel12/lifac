import { SchoolStatus, SchoolType } from "@prisma/client";

export const SCHOOL_STATUS_LABELS: Record<SchoolStatus, string> = {
  NON_CONFIRMEE: "Non confirmée",
  CONFIRMEE: "Confirmée",
  AFFECTEE: "Affectée",
  EN_COURS: "En cours",
  EXECUTEE: "Exécutée",
};

export const SCHOOL_STATUS_COLORS: Record<SchoolStatus, string> = {
  NON_CONFIRMEE: "bg-gray-100 text-gray-700",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  AFFECTEE: "bg-amber-100 text-amber-700",
  EN_COURS: "bg-purple-100 text-purple-700",
  EXECUTEE: "bg-emerald-100 text-emerald-700",
};

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  PRIMAIRE: "Primaire",
  SECONDAIRE: "Secondaire",
  PRIMAIRE_SECONDAIRE: "Primaire + Secondaire",
  PUBLIQUE_PRIMAIRE: "Publique primaire",
  PUBLIQUE_SECONDAIRE: "Publique secondaire",
  PRIVEE_PRIMAIRE: "Privée primaire",
  PRIVEE_SECONDAIRE: "Privée secondaire",
  PRIVEE_PRIMAIRE_SECONDAIRE: "Privée primaire + secondaire",
  UNIVERSITAIRE_PRIVEE: "Universitaire privée",
  UNIVERSITAIRE_PUBLIQUE: "Universitaire publique",
};
