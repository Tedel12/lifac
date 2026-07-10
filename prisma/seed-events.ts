/**
 * Script de seed : crée les événements réels dans la table `events`.
 * Idempotent (upsert sur le slug) : peut être relancé sans créer de doublons.
 *
 * Utilisation :
 *   npx tsx prisma/seed-events.ts
 * (si tsx n'est pas installé : npm install -D tsx)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const events = [
    {
        slug: "firecamp-2026",
        title: "FireCamp 2026",
        shortDescription: "Formation Intensive en Évangélisation — équiper les ouvriers pour la moisson.",
        description:
            "FireCamp 2026 est le camp de formation intensive de LiFAC dédié à l'équipement des ouvriers pour l'évangélisation. Enseignements, mise en pratique et vie communautaire pendant toute la durée du camp.",
        type: "YOUTH_CAMP" as const,
        location: "AD Temple Universitaire",
        city: "Cotonou",
        startDate: new Date("2026-11-09T08:00:00"),
        endDate: new Date("2026-11-14T19:00:00"),
        requiresRegistration: true,
    },
    {
        slug: "jesus-au-marche-2026",
        title: "Jésus au marché",
        shortDescription: "Évangélisation directe dans les marchés, campagne d'été 2026.",
        description:
            "Une série de sorties d'évangélisation dans plusieurs marchés, pour aller à la rencontre des commerçants et clients avec le message de l'Évangile.",
        type: "MARKET_OUTREACH" as const,
        location: "Divers marchés",
        city: null,
        // Date provisoire (plage "Juillet - Août 2026" dans le contenu marketing d'origine) — à ajuster dès que la date exacte est fixée.
        startDate: new Date("2026-07-15T08:00:00"),
        endDate: new Date("2026-08-31T18:00:00"),
        requiresRegistration: true,
    },
    {
        slug: "youth-crusade-2026",
        title: "Youth Crusade",
        shortDescription: "Croisade d'évangélisation dédiée aux jeunes, campagne Sept-Déc 2026.",
        description:
            "Youth Crusade rassemble les jeunes autour de temps forts d'évangélisation et de louange, avec plusieurs dates réparties de septembre à décembre 2026.",
        type: "SCHOOL_OUTREACH" as const,
        location: "Divers lieux",
        city: null,
        // Date provisoire (plage "Sept - Déc 2026") — à ajuster dès que la date exacte est fixée.
        startDate: new Date("2026-09-15T09:00:00"),
        endDate: new Date("2026-12-20T18:00:00"),
        requiresRegistration: true,
    },
    {
        slug: "formation-evangelisation-2026",
        title: "Formation Évangélisation",
        shortDescription: "Formation pratique en techniques d'évangélisation.",
        description:
            "Un cycle de formation pour apprendre et pratiquer l'évangélisation de rue et de maison en maison, ouvert à tous les membres et bénévoles.",
        type: "TRAINING" as const,
        location: "AD Ste Rita",
        city: "Cotonou",
        startDate: new Date("2026-07-07T19:30:00"),
        endDate: new Date("2026-08-31T21:00:00"),
        requiresRegistration: true,
    },
    {
        slug: "croisade-evangelisation-2026",
        title: "Croisade d'Évangélisation",
        shortDescription: "Grande croisade d'évangélisation à Tokpa Domè.",
        description:
            "Croisade d'évangélisation de grand format organisée à Tokpa Domè, avec prédication, louange et appel à la conversion.",
        type: "CRUSADE" as const,
        location: "Tokpa Domè",
        city: "Cotonou",
        // Date provisoire (mois d'Août 2026 uniquement dans le contenu d'origine) — à ajuster dès que la date exacte est fixée.
        startDate: new Date("2026-08-15T19:00:00"),
        endDate: null,
        requiresRegistration: true,
    },
    {
        slug: "nuit-du-saint-esprit-2027",
        title: "NUIT DU SAINT-ESPRIT",
        shortDescription: "Grande nuit de prière et d'effusion du Saint-Esprit au Campus UAC.",
        description:
            "Une nuit entière consacrée à la prière, la louange et la recherche de la présence de Dieu, ouverte à tous, sur le Campus UAC.",
        type: "PRAYER_MEETING" as const,
        location: "Campus UAC",
        city: "Abomey-Calavi",
        startDate: new Date("2027-05-09T18:00:00"),
        endDate: null,
        requiresRegistration: true,
    },
];

async function main() {
    for (const event of events) {
        const result = await prisma.event.upsert({
            where: { slug: event.slug },
            update: event,
            create: event,
        });
        console.log(`✓ ${result.title} (${result.id})`);
    }
}

main()
    .catch((e) => {
        console.error("Erreur de seed :", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });