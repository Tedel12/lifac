# LiFAC Platform — Contexte du projet

> Fichier de contexte généré par inspection du code. Dernière mise à jour: 2026-08-02.
> À tenir à jour à mesure que le projet évolue.

**Description**: Plateforme web pour Light For All Center (LiFAC) — évangélisation et action humanitaire au Bénin. Gère campagnes de dons, événements/croisades, activités de terrain, missionnaires (bénévoles), écoles, présence (QR code), prière, témoignages, et un espace admin complet.

## Stack technique
- **Next.js 16.2.4** (App Router) + **React 19** — README dit "Next.js 15", c'est obsolète.
- **Prisma 6.1** + **PostgreSQL 17** (Neon)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (style `radix-nova`), palette custom `lifac.navy.*` / `lifac.red.*`. **Design system unifié en 2026-08-01** : tout le site public (hors la home) et l'admin sont désormais en thème **clair** (fonds blancs / `#F4F5F7`, accents rouge LiFAC) — seules les sections "hero" avec photo restent sombres. Le composant `Button` (`src/components/ui/button.tsx`) est branché sur la palette `lifac.*` (avant : tokens shadcn gris génériques jamais personnalisés → boutons ternes sans identité de marque).
- **i18n**: next-intl, locales `fr` (défaut) et `en` — synchronisées (34/34 clés top-level de chaque côté).
- **Paiement**: FedaPay (Mobile Money MTN/Moov, carte, XOF) via SDK `fedapay`
- **Formulaires**: react-hook-form + zod
- **Médias**: Cloudinary (upload), pdf-lib + qrcode/html5-qrcode (cartes participants, scan présence)
- **Auth**: système custom cookie (voir plus bas), bcryptjs pour hash mots de passe. **`/admin/*` est désormais protégé par `src/middleware.ts`** (voir section Sécurité).
- Node ≥20, TypeScript strict, `@/* -> ./src/*`

## Base de données (prisma/schema.prisma)
23 modèles (dont `PrayerIntercession`, ajouté 2026-08-02). Points clés:
- `User` (Role: ADMIN, EDITOR, VOLUNTEER, DONOR, MEMBER) — les "missionnaires" (terme produit) = `User` role `VOLUNTEER`.
- `Campaign` / `CampaignUpdate` / `Donation` / `PaymentTransaction` — dons, montants en **BigInt centimes XOF**. `Campaign.currentAmount` s'incrémente automatiquement soit via le webhook FedaPay, soit via une confirmation manuelle admin (`updateDonationStatus`, voir plus bas) — les deux chemins restent cohérents.
- `Event` / `EventRegistration` / `AttendanceSession` / `Attendance` — événements + présence QR. Désormais gérable de bout en bout depuis l'admin (`/admin/events`).
- `Activity` — activités de terrain, modèle standalone (indépendant d'Event), code séquentiel type "ACT-2026-00001". `ActivityType` (8 types + OTHER) : CRUSADE, YOUTH_CRUSADE, POP_UP_CRUSADE, MARKET_OUTREACH, ONE_ON_ONE, NIGHT_OF_HOPE, HUMANITARIAN, TRAINING — ordre d'affichage fixé côté client dans `src/lib/activity-types.ts`. **`Activity.assignedToId -> User`** (2026-08-02, migration `20260802000000_activity_assignee`) : relation vers le missionnaire responsable, sélectionnable depuis `/admin/activities` (avant : `responsibleName` était un simple champ texte libre, sans lien réel — impossible de savoir "mes activités" côté missionnaire).
- `Volunteer` / `VolunteerAssignment` — bénévoles/missionnaires
- `School` / `SchoolAssignmentHistory` — écoles + affectation aux missionnaires
- `Testimony`, `PrayerRequest`, `ContactMessage`, `Media`, `AuditLog`, `GlobalStats`, `ModuleDistribution`, `Notification`
- `Account`/`Session` (NextAuth) — présents mais **non utilisés** par le code actuel

Migrations: 5 dossiers — `20260702000000_add_notifications`, `20260706000000_baseline`, `20260725170357_activity_type_extend`, `20260802000000_activity_assignee`, `20260802010000_prayer_category_intercession`.

⚠️ **La table `_prisma_migrations` n'existe pas en base** — le schéma a visiblement toujours été synchronisé via `prisma db push` (ou application manuelle du SQL) plutôt que via `prisma migrate deploy`, malgré la présence de dossiers de migration dans le repo (plus documentation qu'historique réellement appliqué/suivi par Prisma). À noter : **l'endpoint Neon "direct" (`DIRECT_DATABASE_URL`, sans `-pooler`) est injoignable depuis cet environnement de dev** (seul l'endpoint pooler répond, et de façon parfois flaky avec reconnexions nécessaires) — `prisma migrate dev/deploy` échouent donc ici ; toute évolution de schéma doit être appliquée manuellement en SQL via le client Prisma standard (`$executeRawUnsafe`, connexion pooled) jusqu'à ce que ce point réseau soit résolu.

Seed: admin par défaut `admin@lifac.org` / `Admin@LiFAC2026!` (à changer après 1er login), stats globales démo, 3 événements démo (dates mai/juin 2026 — **déjà passées** par rapport à "aujourd'hui" ; le seed devra être rafraîchi périodiquement pour garder des événements visibles sur `/events`), campagnes/activités démo.

## Routes principales

**Public** : `/`, `/about`, `/activities[/id]`, `/activities/type/[type]`, `/campaigns[/slug]`, `/contact`, `/donate[/success]`, `/events[/slug]`, `/resources` (dissociée d'Activités — médiathèque + supports pratiques), `/login`, `/register`, `/prayer`, `/volunteer` (candidature bénévole publique — reste accessible sans connexion, cf. `/volunteer/*` ci-dessous).

**Missionnaire (`/volunteer/*`, hors `/volunteer` public)** — construit le 2026-08-02, jusque-là 6 des 7 liens de la sidebar étaient des 404 et la page dashboard était un simple placeholder :
- Toutes les pages sont dans le groupe de routes `src/app/volunteer/(dashboard)/` (le layout avec sidebar ne s'applique donc pas à `/volunteer` public — bug de nesting corrigé au passage).
- `dashboard` — stats réelles (écoles assignées, activités à venir, décisions pour Christ cumulées) scoping sur le missionnaire connecté.
- `assignments` ("Mes affectations") — écoles assignées (`School.agentId`) + activités à venir assignées (`Activity.assignedToId`, nouvelle relation).
- `reports` — activités passées avec formulaire pour compléter les résultats (participants réels, décisions, Bibles distribuées, nouveaux contacts) → `updateMyActivityOutcome`.
- `converts` — pas de modèle "Convert" individuel (décision produit) : vue agrégée des décisions/contacts par activité.
- `prayer` — mur de prière public en lecture seule.
- `ai-assistant` — page "Bientôt disponible" (pas d'intégration IA cette session).
- `profile` — édition nom/téléphone/mot de passe.

**Admin (`/admin/*`)** — désormais complet, plus aucun lien mort dans la sidebar :
- `dashboard` — KPIs éditables (GlobalStats), répartition par module, **stats opérationnelles réelles** (dons confirmés, campagnes actives, événements à venir) et **activités récentes réelles** (avant : tableau codé en dur, corrigé le 2026-08-01).
- `activities` — CRUD Activity, filtrable par `?type=` (les entrées sidebar "Croisades/Marchés/Pop-croisade/One-to-one" pointent vers ces filtres plutôt que vers des pages dédiées).
- `events` — **nouveau**, CRUD complet (titre, type, dates, lieu, capacité, image, mise en avant) ; alimente directement `/events` et `/events/[slug]`.
- `campaigns` — **nouveau**, CRUD des campagnes de dons.
- `donations` — **nouveau**, liste + changement de statut manuel (confirmation don hors-ligne), avec impact automatique sur `Campaign.currentAmount`.
- `agents` — missionnaires (bug d'affichage corrigé, voir Problèmes connus) + **section "Candidatures en attente"** (2026-08-02) : approuve/rejette les candidatures publiques (`Volunteer.status = PENDING`), l'approbation définit un mot de passe et active le compte (avant, ces candidatures créaient un `User` sans mot de passe et restaient bloquées indéfiniment, aucune page ne les exposait).
- `admins` — comptes administrateurs (create/delete).
- `users` — **nouveau**, comptes DONOR/MEMBER avec activation/désactivation.
- `schools`, `registrations`, `attendance[/[eventId]]` — inchangés, déjà fonctionnels.
- `reports` — **nouveau**, exports CSV (dons, inscriptions, activités) avec filtre de période.
- `settings` — **nouveau**, profil admin connecté (nom, mot de passe).
- `login` — connexion.
- `/admin` (racine) — redirige vers `/admin/dashboard` (avant : page morte basée sur une session jamais alimentée).

**API** : `/api/admin/registrations/[id]/card`, `/api/health`, `/api/webhooks/fedapay`, plus les routes d'export CSV `/admin/reports/{donations,activities,registrations}` et `/admin/attendance/[eventId]/export`.

## Sécurité — ⚠️ point corrigé le 2026-08-01/02
**`/admin/*` (puis `/volunteer/*`) n'avait aucune protection d'authentification** : les layouts affichaient sidebar + contenu à quiconque connaissait l'URL, connecté ou non. Corrigé par **`src/middleware.ts`**, qui gère désormais les deux espaces :
- `/admin/:path*` (sauf `/admin/login`) exige `admin_token === "authorized"` (ADMIN).
- `/volunteer/:path+` (le `+` exclut `/volunteer` seul, qui reste le formulaire public de candidature) exige `admin_token === "authorized_agent"` (ou `"authorized"`, un admin peut prévisualiser).
- Redirige vers `/admin/login` sinon. Couvre pages, Server Actions (POST vers l'URL d'origine) et routes d'export CSV.

Reste à améliorer (mineur, non bloquant) : la page `/admin/login` est toujours techniquement rendue à l'intérieur du layout admin (donc partage le même arbre de composants), même si le middleware empêche d'y arriver avec du contenu sensible avant connexion.

## Server actions (`src/actions/`)
- `activity-actions.ts` — CRUD Activity
- `admin-actions.ts` — notifications, recherche admin, **assignation dons↔écoles — BUG TOUJOURS PRÉSENT** : `getAvailableDonations`, `assignDonationsToSchool`, `getSchoolDonationsHistory` référencent `Donation.schoolId`, champ absent du schéma Prisma. Plante à l'exécution si utilisé (non lié au nouveau CRUD `/admin/donations`, qui n'en dépend pas).
- `admin-management-actions.ts` — `getAdmins`, `createAdmin`, `deleteAdmin`, **+ `getCurrentAdminProfile`/`updateAdminProfile`** (nouveau, pour `/admin/settings`).
- `admin-agent-actions.ts` / `agent-actions.ts` — **toujours deux implémentations divergentes de `getAgents()`** (non réconciliées, risque connu, cf. Problèmes connus). `admin-agent-actions.ts` a gagné `getPendingApplications`/`approveVolunteerApplication`/`rejectVolunteerApplication` (2026-08-02) et vérifie désormais l'unicité d'email avant `createAgent` (avant : crash Prisma non catché côté client).
- `admin-events-actions.ts` — CRUD Event (slug auto-généré + dédupliqué).
- `admin-campaigns-actions.ts` — CRUD Campaign.
- `admin-donations-actions.ts` — `getDonations`, `getDonationStats`, `updateDonationStatus` (incrémente/décrémente `Campaign.currentAmount` en cohérence avec le webhook FedaPay).
- `admin-users-actions.ts` — `getCommunityUsers`, `toggleUserActive` (rôles DONOR/MEMBER).
- `volunteer-actions.ts` — **nouveau** (2026-08-02) : `getMyOverview`, `getMySchools`, `getMyActivities`, `updateMyActivityOutcome`, `getPrayerWall`, `getMyProfile`/`updateMyProfile` — toutes scoping via `getCurrentAgentId()`.
- `attendance.ts` — sessions de présence, scan QR, présence manuelle, stats.
- `auth.ts` — login admin (DB puis fallback env vars) / agent (DB), logout, `isUserAuthenticated`, `getCurrentAdminName`/`Id`, **+ `getCurrentAgentName`/`getCurrentAgentId`** (2026-08-02, cookies `agent_id`/`agent_display_name` posés par `loginAgent`, sans quoi il était impossible de savoir quel missionnaire était connecté).
- `community.ts` — inscription événement, candidature bénévole (`applyAsVolunteer`, crée un `User` sans mot de passe + `Volunteer` PENDING — voir la nouvelle validation admin ci-dessus), contact, prière.
- `dashboard.ts` — stats globales + distribution modules (GlobalStats/ModuleDistribution, éditables depuis le dashboard).
- `donations.ts` — création don + intégration FedaPay (flux public).
- `admin-management-actions.ts` — `createAdmin` réactive désormais un compte admin précédemment désactivé (même email) au lieu de planter sur la contrainte unique.
- `locale.ts`, `school-actions.ts` — inchangés.
- `admin-media-actions.ts` — **nouveau** (2026-08-02) : `getAllMedia`, `uploadMedia` (Cloudinary), `deleteMedia`, pour `/admin/media`.
- `admin-audit-log-actions.ts` — **nouveau** : `getAuditLog`, pour `/admin/audit-log`.
- `src/lib/audit-log.ts` — **nouveau** : `logAudit()`, helper best-effort branché sur les actions admin sensibles (voir Vague 4).
- `src/lib/pdf-export.ts` — **nouveau** : `generateSimplePdfTable()` (pdf-lib), utilisé par les routes `/admin/reports/*?format=pdf`.

## Authentification
Deux systèmes coexistent :
1. `src/lib/session.ts` — session HMAC cookie `lifac_session`, **non utilisée** en pratique.
2. `src/actions/auth.ts` — système réellement branché : `loginAdmin()` cherche d'abord un `User` role ADMIN en DB (bcrypt), sinon retombe sur le super-admin `ADMIN_EMAIL`/`ADMIN_PASSWORD` (env vars, `admin_id="env-admin"` — ce compte n'est pas éditable depuis `/admin/settings`, message explicite affiché). Cookies : `admin_token` (`"authorized"` = ADMIN, `"authorized_agent"` = VOLUNTEER), `admin_display_name`, `admin_id`.
Pas de vraie session pour donateurs/membres (`/login`, `/register` existent côté UI mais logique non retrouvée dans `auth.ts`).

## Paiement FedaPay (`src/lib/fedapay.ts`)
Flow inchangé : `/donate` → `createDonation()` → `Donation` PENDING → FedaPay checkout → webhook `/api/webhooks/fedapay` (HMAC vérifié, idempotent) → `Campaign.currentAmount` incrémenté. Le nouveau `/admin/donations` (confirmation manuelle) réplique cette incrémentation pour rester cohérent hors paiement en ligne.

## Refonte design 2026-08-01 (session complète)
Contexte : le client a fourni des maquettes (`page activités.jpg`, `page events.jpg`), un PDF des 8 activités et un docx de formulaire d'événement. Le travail s'est fait en deux grandes vagues :

**Vague 1 — Pages publiques** :
- `src/lib/activity-types.ts` — table de correspondance centrale par `ActivityType` (icône, slug, image, clé de traduction), source unique pour grilles/formulaires.
- `/activities`, `/activities/[id]`, `/activities/type/[type]` — thème clair, galerie/témoignages, "Où nous servons / Missions à venir".
- `/events` — reconstruite en server component branché sur `prisma.event` (avant : 100% statique). Stats réelles, événement vedette, grille d'événements à venir, catégories filtrables (`?type=`), calendrier, villes, témoignage.
- `/about` — thème clair (hero compris — pas de photo donc pas de justification à rester sombre).
- `/resources` — nouvelle page (médiathèque + supports), dissociée d'Activités ; lien header/footer corrigés.
- `/contact` — hero passé en clair.
- Header (`src/components/layout/header.tsx`) — repensé : **barre blanche pleine sur toutes les pages sauf la home** (avant : transparent+texte blanc partout, illisible dès qu'on scrollait dans une section claire). La home garde son traitement transparent-sur-hero.
- Footer — passé en blanc avec accents rouges (avant : dégradé rouge, jugé "trop différent" du rouge LiFAC utilisé ailleurs).
- Toutes les bandes rouges/noires "de clôture" avant footer (impact banner, CTA finaux, bandeau témoignage) repassées en blanc/clair suite aux retours utilisateur — seules les vraies photos-hero restent sombres.

**Vague 2 — Admin dashboard** : voir sections Routes/Sécurité/Server actions ci-dessus. Sidebar (`src/components/admin/sidebar.tsx`) réorganisée en sections avec surbrillance active, **passée de fond rouge plein à fond blanc + texte/icônes rouges** (retour utilisateur).

**Vague 2bis — Ajustements fond blanc** (2026-08-02, retour utilisateur après la vague 2) : plusieurs sections restaient rouges/noires alors qu'elles auraient dû suivre le thème clair — corrigées : hero `/about` (pas de photo, donc pas de justification à rester sombre), bandeau "Notre Impact" et CTA final sur `/activities`, témoignage + bandeau newsletter sur `/events`, `CtaSection` de la home (avant footer), CTA final `/resources`, hero `/contact`. Le header (`src/components/layout/header.tsx`) a dû être revu en parallèle : barre **blanche pleine avec texte navy** sur toutes les pages hors accueil (avant : texte blanc transparent, illisible sur fond clair) — sinon les nouvelles sections claires rendaient la nav illisible.

**Vague 3 — Dashboard missionnaire** (2026-08-02) : voir section Routes ci-dessus (`/volunteer/*`). Fondations ajoutées : cookies d'identité `agent_id`/`agent_display_name`, relation `Activity.assignedToId`, protection middleware, validation des candidatures bénévoles côté admin. Thème identique (fond blanc, cartes avec `hover:-translate-y-1`/`animate-fade-in`, boutons de marque) — retour utilisateur explicite en cours de session pour privilégier fond blanc + effets/animations sur ces nouvelles pages.

## Variables d'environnement — ⚠️ FUITE DE SECRETS CONFIRMÉE (non traité)
`.env.example` est tracké par git depuis le premier commit et contient de **vraies chaînes de connexion Neon** en clair (`DATABASE_URL`, `DIRECT_DATABASE_URL`), pas des placeholders. À faire tourner ces identifiants et nettoyer `.env.example` dès que possible — non traité durant cette session (hors périmètre design/fonctionnel demandé).

Manquent dans `.env.example` mais requis par le code : `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

## Problèmes connus à corriger
1. **`admin-actions.ts` référence `Donation.schoolId`** inexistant — `getAvailableDonations`/`assignDonationsToSchool`/`getSchoolDonationsHistory` plantent si appelés. Pas utilisé par le nouveau `/admin/donations`.
2. Deux `getAgents()` divergentes (`admin-agent-actions.ts` vs `agent-actions.ts`) — non réconciliées.
3. **Fuite de secrets réels dans `.env.example`** — voir section dédiée.
4. Docs obsolètes : README indique Next.js 15 (réel : 16.x).
5. Flux d'authentification donateur/membre (`/login`, `/register`) à clarifier.
6. Seed events (mai/juin 2026) déjà passés par rapport à la date courante — créer des événements à dates futures depuis `/admin/events` pour peupler `/events`.
7. `/admin/login` reste rendu dans le layout admin (cosmétique, pas un problème de sécurité grâce au middleware).
8. Les Server Actions admin (`createEvent`, etc.) n'ont pas de vérification d'auth individuelle — protégées indirectement par `src/middleware.ts` (qui bloque toute requête vers `/admin/*`), mais pas de défense en profondeur au niveau de l'action elle-même.
9. **`_prisma_migrations` absente en base** + endpoint Neon direct injoignable depuis cet environnement — voir section Base de données. Toute migration future devra être appliquée manuellement tant que ce n'est pas résolu (accès réseau ou changement d'environnement d'exécution).
10. `converts` (dashboard missionnaire) affiche un cumul par activité, pas une liste nominative de convertis — aucun modèle `Convert` n'existe (décision produit assumée le 2026-08-02).
11. `ai-assistant` (dashboard missionnaire) est une simple page "Bientôt disponible" — aucune intégration IA n'existe dans le projet.

## Vague 4 — Audit cahier des charges + comblement de 6 modules (2026-08-02)
Après le dashboard missionnaire, audit complet du "CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE" (20 modules web) vs code existant. Résultat détaillé communiqué à l'utilisateur ; il a sélectionné 6 modules à traiter immédiatement (les autres restent en **backlog non démarré**, voir liste en fin de section). Réalisé :

- **Module 2 (Dashboard KPIs/graphiques)** — `src/actions/dashboard.ts::getExtendedDashboardMetrics()` : décisions pour Christ, nouveaux contacts, églises partenaires actives, missionnaires actifs (nouvelles cartes KPI) + 3 graphiques (évolution mensuelle 6 mois en barres CSS, taux d'efficacité en anneau conic-gradient, répartition géographique par commune en barres horizontales) — tout calculé côté serveur, pas de lib de charting ajoutée. Câblé dans `dashboard-content.tsx`/`admin/dashboard/page.tsx`.
- **Module 11 (Intercession)** — schéma : `PrayerRequest.category` (`PrayerCategory` enum : PROTECTION/SALUT/GUERISON/DELIVRANCE/AUTRE) + nouveau modèle `PrayerIntercession` (historique "qui a prié, quand"). Migration `20260802010000_prayer_category_intercession` (appliquée manuellement, voir contrainte réseau Neon ci-dessous). Formulaire public (`prayer-request-form.tsx`) a un sélecteur de catégorie. `submitPrayerRequest` crée désormais une `Notification` admin à chaque nouvelle demande. Mur de prière missionnaire (`/volunteer/prayer`) affiche la catégorie (badge coloré) et un bouton "J'ai prié" (`markPrayed()`) qui incrémente `prayerCount` et journalise l'intercession (3 derniers noms affichés).
- **Module 14 (Statistiques avancées)** — `src/lib/pdf-export.ts` (nouveau, basé sur `pdf-lib` déjà présent en dépendance — pas de nouvelle lib) génère un PDF tabulaire simple, paginé. Les 3 routes d'export existantes (`donations`, `registrations`, `activities`) acceptent désormais `?format=pdf` en plus du CSV existant, et une 4ᵉ route `schools` a été ajoutée. Filtres ajoutés : `agentId` + `commune` sur activités/écoles, `department` sur écoles, `city` sur inscriptions. Page `/admin/reports` mise à jour avec sélecteurs (missionnaire, commune/ville, département) et double bouton CSV/PDF par rapport. **Note** : l'export "Excel" reste au format CSV avec BOM UTF-8 (déjà compatible Excel, pattern existant) — aucune lib `xlsx`/`exceljs` n'a été ajoutée, à discuter si un vrai `.xlsx` est nécessaire.
- **Module 16 (Médiathèque)** — nouvelle page `/admin/media` (`src/actions/admin-media-actions.ts` + `src/app/admin/media/page.tsx`) : grille de vignettes, upload (Cloudinary, réutilise `uploadToCloudinary` déjà utilisé pour les inscriptions), suppression. Alimente directement la galerie déjà consommée par `/resources` (`prisma.media`). A nécessité de remonter `experimental.serverActions.bodySizeLimit` de `2mb` à `10mb` dans `next.config.ts` (sinon upload de photos échoue silencieusement au-delà de 2 Mo).
- **Module 18 (Notifications automatiques)** — jusqu'ici le modèle `Notification` n'était alimenté que manuellement (seed). Désormais créées automatiquement à 4 endroits : nouvelle inscription événement (`registerForEvent`), nouvelle candidature missionnaire (`applyAsVolunteer`), nouveau message de contact (`sendContactMessage`), nouvelle demande de prière (`submitPrayerRequest`), et don confirmé (`api/webhooks/fedapay/route.ts`, sur passage à `APPROVED`). Toutes visibles dans la cloche `AdminHeaderBar` existante — aucune nouvelle UI de notification nécessaire.
- **Module 20 (Sécurité — AuditLog)** — `AuditLog` était un modèle mort (jamais écrit). Nouveau helper `src/lib/audit-log.ts::logAudit()` (best-effort, n'interrompt jamais l'action appelante en cas d'échec d'écriture) branché sur les actions sensibles : création/réactivation/désactivation admin, création/modification/suppression missionnaire, approbation/rejet de candidature, création/suppression campagne, création/suppression événement, changement de statut don. Nouvelle page de consultation `/admin/audit-log` (lecture seule, 100 dernières entrées, libellés français par action).

Tous les changements de schéma ont été appliqués manuellement en SQL sur l'endpoint pooled (même contrainte réseau que la migration précédente — voir section Base de données), puis `npx prisma generate` régénéré après arrêt du serveur dev (le `.dll.node` de l'engine Prisma était verrouillé par le process `next dev` en cours). Vérification : `npx tsc --noEmit` ne révèle aucune nouvelle erreur (les erreurs présentes sont toutes pré-existantes et sans lien avec ce lot — `admin-actions.ts` `Donation.schoolId`, typage `messageKey` de `applyAsVolunteer`, `qrcode` sans types, etc.) ; requêtes Prisma des nouvelles fonctions vérifiées directement contre la base réelle.

### Backlog restant du cahier des charges (non démarré, à reprendre sur demande)
- **Module 1** — réinitialisation de mot de passe / 2FA : absent.
- **Module 4** — affectation intelligente **automatique** (IA/algorithme distance-disponibilité-charge) : seule l'affectation manuelle existe.
- **Module 5** — `deleteAgent` fait une suppression **définitive** (pas de désactivation/réactivation comme pour les admins) ; pas de champs matricule/fonction/zone dédiée sur `User`.
- **Module 7** — une activité n'a qu'un seul missionnaire responsable (`assignedToId`), pas de notion d'équipe.
- **Module 8** — pas d'upload photo/vidéo sur les rapports de terrain missionnaire.
- **Module 9** — suivi nominatif des nouveaux convertis : décision déjà actée de ne PAS le faire (vue agrégée à la place).
- **Module 10** — `PartnerChurch` existe en base (déjà utilisé par `Event`) mais aucune page admin CRUD dédiée.
- **Module 12** — chatbot IA : page "Bientôt disponible" volontaire.
- **Module 13** — carte d'impact interactive : rien.
- **Module 15** — centre de formation (cours/quiz/certification) : rien.
- **Module 17** — gestion budgétaire (revenus/dépenses) : rien.
- **Module 19** — mode hors connexion : concept pensé pour l'app mobile Flutter (autre livrable du cahier des charges), non applicable tel quel au site web.

## Git
Branche `main`. Historique récent (du plus ancien au plus récent) : refonte design pages publiques → dashboard admin complet → correction contexte → fix crash création admin/missionnaire → dashboard missionnaire → itinéraire GPS missionnaire → 6 modules du cahier des charges (dashboard KPIs, intercession, exports PDF/filtres, médiathèque, notifications auto, audit log) — à committer/pousser au moment de la rédaction de cette note.
