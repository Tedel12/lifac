/**
 * Seed Prisma - Données de démonstration pour LiFAC
 * Lancer avec : npm run db:seed
 */
import { PrismaClient, CampaignType, CampaignStatus, EventType, EventStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed LiFAC...");

  // -----------------------------------
  // 1. Utilisateur admin par défaut
  // -----------------------------------
  const adminPassword = await bcrypt.hash("Admin@LiFAC2026!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lifac.org" },
    update: {},
    create: {
      email: "admin@lifac.org",
      name: "Administrateur LiFAC",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+22999000000",
      city: "Abomey-Calavi",
      country: "Bénin",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin créé :", admin.email);

  // -----------------------------------
  // 2. Statistiques globales
  // -----------------------------------
  await prisma.globalStats.deleteMany();
  await prisma.globalStats.create({
    data: {
      totalSoulsWon: 32500,
      schoolsVisited: 785,
      marketOutreach: 350,
      totalCrusades: 45,
      totalDonations: BigInt(0),
      totalVolunteers: 120,
    },
  });
  console.log("✅ Statistiques globales initialisées");

  // -----------------------------------
  // 3. Campagnes de démonstration
  // -----------------------------------
  const campaigns = [
    {
      slug: "soutien-orphelinat-cotonou",
      title: "Soutien à l'orphelinat de Cotonou",
      shortDescription:
        "Aidez-nous à offrir nourriture, éducation et amour à 80 enfants orphelins de notre centre de Cotonou.",
      description: `Depuis 2020, l'orphelinat partenaire de LiFAC à Cotonou accueille 80 enfants en situation de vulnérabilité. Nous couvrons leur scolarité, leurs repas quotidiens, leur santé et leur accompagnement spirituel. Votre don permet de pérenniser cette mission essentielle.`,
      type: CampaignType.HUMANITARIAN,
      status: CampaignStatus.ACTIVE,
      goalAmount: BigInt(15_000_000_00), // 15 000 000 XOF en centimes
      currentAmount: BigInt(7_500_000_00),
      coverImageUrl: "/images/campaigns/orphanage.jpg",
      location: "Cotonou, Bénin",
      beneficiariesCount: 80,
      isFeatured: true,
      isUrgent: false,
    },
    {
      slug: "croisade-jeunesse-2026",
      title: "Croisade Jeunesse Abomey-Calavi 2026",
      shortDescription:
        "Financez la prochaine grande croisade d'évangélisation pour la jeunesse béninoise à Abomey-Calavi.",
      description: `La Croisade Jeunesse 2026 réunira plus de 5 000 jeunes pour 3 jours de louange, d'enseignement et d'évangélisation. Logistique, sonorisation, accueil, distribution de Bibles : chaque don compte pour toucher cette génération.`,
      type: CampaignType.EVANGELISM,
      status: CampaignStatus.ACTIVE,
      goalAmount: BigInt(25_000_000_00),
      currentAmount: BigInt(8_200_000_00),
      coverImageUrl: "/images/campaigns/youth-crusade.jpg",
      location: "Abomey-Calavi, Bénin",
      beneficiariesCount: 5000,
      isFeatured: true,
    },
    {
      slug: "soutien-medical-malades",
      title: "Soutien médical aux malades démunis",
      shortDescription:
        "Prise en charge des soins médicaux pour les familles ne pouvant payer leurs traitements.",
      description: `Chaque mois, des dizaines de familles nous appellent à l'aide pour des frais médicaux qu'elles ne peuvent assumer. Ce fonds d'urgence permet de couvrir consultations, médicaments et hospitalisations urgentes.`,
      type: CampaignType.EMERGENCY,
      status: CampaignStatus.ACTIVE,
      goalAmount: BigInt(10_000_000_00),
      currentAmount: BigInt(2_300_000_00),
      coverImageUrl: "/images/campaigns/medical.jpg",
      location: "Bénin",
      isUrgent: true,
    },
  ];

  for (const c of campaigns) {
    await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`✅ ${campaigns.length} campagnes créées`);

  // -----------------------------------
  // 4. Événements de démonstration
  // -----------------------------------
  const events = [
    {
      slug: "croisade-cotonou-mai-2026",
      title: "Grande Croisade de Cotonou",
      shortDescription:
        "Trois soirées d'évangélisation au stade Charles de Gaulle.",
      description:
        "Rejoignez-nous pour une grande croisade de 3 jours avec louange, prédications et ministère de prière.",
      type: EventType.CRUSADE,
      status: EventStatus.UPCOMING,
      startDate: new Date("2026-05-15T18:00:00Z"),
      endDate: new Date("2026-05-17T22:00:00Z"),
      location: "Stade Charles de Gaulle",
      city: "Cotonou",
      country: "Bénin",
      latitude: 6.3703,
      longitude: 2.3912,
      maxAttendees: 10000,
      requiresRegistration: false,
      isFeatured: true,
    },
    {
      slug: "evangelisation-marche-dantokpa",
      title: "Évangélisation Marché Dantokpa",
      shortDescription: "Action d'évangélisation au plus grand marché du Bénin.",
      description:
        "Une matinée de partage de l'Évangile, distribution de tracts et prière pour les commerçants.",
      type: EventType.MARKET_OUTREACH,
      status: EventStatus.UPCOMING,
      startDate: new Date("2026-06-08T08:00:00Z"),
      endDate: new Date("2026-06-08T13:00:00Z"),
      location: "Marché Dantokpa",
      city: "Cotonou",
      country: "Bénin",
      latitude: 6.3654,
      longitude: 2.4256,
    },
    {
      slug: "formation-evangelistes-juin-2026",
      title: "Formation Évangélistes",
      shortDescription: "Formation intensive de 5 jours pour les évangélistes.",
      description:
        "Programme complet : herméneutique, apologétique, communication chrétienne, ministère personnel.",
      type: EventType.TRAINING,
      status: EventStatus.UPCOMING,
      startDate: new Date("2026-06-20T09:00:00Z"),
      endDate: new Date("2026-06-24T17:00:00Z"),
      location: "Centre LiFAC",
      city: "Abomey-Calavi",
      country: "Bénin",
      maxAttendees: 50,
      requiresRegistration: true,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }
  console.log(`✅ ${events.length} événements créés`);

  // -----------------------------------
  // 5. Témoignages
  // -----------------------------------
  const testimonies = [
    {
      authorName: "Benjamin B.",
      authorRole: "Étudiant, Hope Academy",
      content:
        "Quand LiFAC est venu dans notre école, j'ai entendu le message de l'Évangile pour la première fois. Il a touché mon cœur, et j'ai décidé de suivre Christ.",
      isApproved: true,
      isFeatured: true,
    },
    {
      authorName: "Marie A.",
      authorRole: "Commerçante, Marché Dantokpa",
      content:
        "Les frères de LiFAC sont venus prier pour moi au marché. Depuis ce jour, ma vie a changé. Mon commerce et ma famille sont bénis.",
      isApproved: true,
      isFeatured: true,
    },
    {
      authorName: "Pasteur Jean K.",
      authorRole: "Église partenaire, Porto-Novo",
      content:
        "Le partenariat avec LiFAC a transformé notre communauté. Plus de 200 personnes ont rejoint l'église après leur croisade.",
      isApproved: true,
      isFeatured: true,
    },
  ];

  for (const t of testimonies) {
    await prisma.testimony.create({ data: t });
  }
  console.log(`✅ ${testimonies.length} témoignages créés`);

  // -----------------------------------
  // 6. Écoles
  // -----------------------------------
  const schools = [
    { code: "SCH001", name: "Lycée Béhanzin", address: "Porto-Novo", commune: "Porto-Novo", department: "Ouémé", responsibleName: "Jean Dupont", phone: "+22900000001", estimatedStudents: 500 },
    { code: "SCH002", name: "Collège Catholique", address: "Cotonou", commune: "Cotonou", department: "Littoral", responsibleName: "Marie Curie", phone: "+22900000002", estimatedStudents: 800 },
    { code: "SCH003", name: "Lycée Technique", address: "Abomey-Calavi", commune: "Abomey-Calavi", department: "Atlantique", responsibleName: "Paul Martin", phone: "+22900000003", estimatedStudents: 1200 },
    { code: "SCH004", name: "Collège Moderne", address: "Parakou", commune: "Parakou", department: "Borgou", responsibleName: "Sophie Durand", phone: "+22900000004", estimatedStudents: 600 },
    { code: "SCH005", name: "Lycée Mathieu Kérékou", address: "Natitingou", commune: "Natitingou", department: "Atacora", responsibleName: "Luc Bernard", phone: "+22900000005", estimatedStudents: 700 },
  ];

  for (const a of activities) {
  await prisma.activity.create({
    data: {
      title: "Croisade d’évangélisation",
      description: "Les Croisades d'Évangélisation de LiFAC...",
      code: "VALEUR_DE_VOTRE_CHOIX" // Ajoutez cette ligne avec un code unique
    }
  })
}

  // -----------------------------------
  // 7. Activités
  // -----------------------------------
  const activities = [
    { title: "Croisade d’évangélisation", description: "Les Croisades d'Évangélisation de LiFAC sont des campagnes d'évangélisation organisées dans les villes et les communautés afin d'annoncer la Bonne Nouvelle de Jésus-Christ au plus grand nombre. Elles se déroulent généralement sur trois à quatre jours consécutifs, permettant aux populations de participer à plusieurs soirées de prédication et de prière." },
    { title: "Youth Crusades", description: "Youth Crusades est le programme d'évangélisation de LiFAC spécialement consacré à la jeunesse. Il a pour objectif d'annoncer l'Évangile de Jésus-Christ aux élèves, étudiants et jeunes en formation, directement dans leurs milieux de vie et d'apprentissage." },
    { title: "Évangélisation au marché", description: "Jésus au Marché est un programme d'évangélisation de proximité organisé par LiFAC dans les marchés et les espaces commerciaux. Son objectif est de porter l'Évangile de Jésus-Christ au cœur des lieux où les populations vivent, travaillent et se rencontrent quotidiennement." },
    { title: "Pop-up crusade", description: "Pop-Up Crusade est un programme de croisades d'évangélisation de proximité organisé par LiFAC (Light For All Center). Il consiste à déployer, de manière ponctuelle et avec un minimum de matériel, une équipe d'évangélisation dans un village, un quartier, un carrefour, une place publique ou tout autre espace accessible." },
    { title: "Évangélisation personnelle", description: "Évangélisation Personnelle est un programme de proximité de LiFAC (Light For All Center) qui consiste à aller à la rencontre des personnes, individuellement, pour leur annoncer la Bonne Nouvelle de Jésus-Christ dans le cadre d'un échange personnel." },
    { title: "La Nuit de l’Espoir", description: "La Nuit de l'Espoir est un programme d'évangélisation organisé par LiFAC (Light For All Center). Cette rencontre, qui se tient chaque année entre les mois de mai et juillet, est entièrement consacrée à la proclamation de l'Évangile de Jésus-Christ et à la manifestation de la puissance du Saint-Esprit." },
    { title: "Actions Humanitaires", description: "Actions Humanitaires est un programme périodique de LiFAC (Light For All Center) qui vise à manifester l’amour de Dieu de manière concrète à travers des actions sociales et médicales en faveur des personnes en situation de vulnérabilité." },
    { title: "Formation en Évangélisation", description: "La Formation en Évangélisation est un programme de formation et d'équipement de LiFAC (Light For All Center) destiné à préparer et à envoyer des ouvriers qualifiés pour l'œuvre de l'évangélisation." },
  ];

  for (const a of activities) {
    await prisma.activity.create({
      data: a,
    });
  }
  console.log(`✅ ${activities.length} activités créées`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
