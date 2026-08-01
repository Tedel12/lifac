# LiFAC Platform — Contexte du projet

> Fichier de contexte généré par inspection du code. Dernière mise à jour: 2026-08-01.
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
21 modèles. Points clés:
- `User` (Role: ADMIN, EDITOR, VOLUNTEER, DONOR, MEMBER) — les "missionnaires" (terme produit) = `User` role `VOLUNTEER`.
- `Campaign` / `CampaignUpdate` / `Donation` / `PaymentTransaction` — dons, montants en **BigInt centimes XOF**. `Campaign.currentAmount` s'incrémente automatiquement soit via le webhook FedaPay, soit via une confirmation manuelle admin (`updateDonationStatus`, voir plus bas) — les deux chemins restent cohérents.
- `Event` / `EventRegistration` / `AttendanceSession` / `Attendance` — événements + présence QR. Désormais gérable de bout en bout depuis l'admin (`/admin/events`).
- `Activity` — activités de terrain, modèle standalone (indépendant d'Event), code séquentiel type "ACT-2026-00001". `ActivityType` (8 types + OTHER) : CRUSADE, YOUTH_CRUSADE, POP_UP_CRUSADE, MARKET_OUTREACH, ONE_ON_ONE, NIGHT_OF_HOPE, HUMANITARIAN, TRAINING — ordre d'affichage fixé côté client dans `src/lib/activity-types.ts`.
- `Volunteer` / `VolunteerAssignment` — bénévoles/missionnaires
- `School` / `SchoolAssignmentHistory` — écoles + affectation aux missionnaires
- `Testimony`, `PrayerRequest`, `ContactMessage`, `Media`, `AuditLog`, `GlobalStats`, `ModuleDistribution`, `Notification`
- `Account`/`Session` (NextAuth) — présents mais **non utilisés** par le code actuel

Migrations: 3 dossiers — `20260702000000_add_notifications`, `20260706000000_baseline`, `20260725170357_activity_type_extend`.

Seed: admin par défaut `admin@lifac.org` / `Admin@LiFAC2026!` (à changer après 1er login), stats globales démo, 3 événements démo (dates mai/juin 2026 — **déjà passées** par rapport à "aujourd'hui" ; le seed devra être rafraîchi périodiquement pour garder des événements visibles sur `/events`), campagnes/activités démo.

## Routes principales

**Public** : `/`, `/about`, `/activities[/id]`, `/activities/type/[type]`, `/campaigns[/slug]`, `/contact`, `/donate[/success]`, `/events[/slug]`, `/resources` (**nouvelle page**, dissociée d'Activités — médiathèque + supports pratiques), `/login`, `/register`, `/prayer`, `/volunteer[/dashboard]`.

**Admin (`/admin/*`)** — désormais complet, plus aucun lien mort dans la sidebar :
- `dashboard` — KPIs éditables (GlobalStats), répartition par module, **stats opérationnelles réelles** (dons confirmés, campagnes actives, événements à venir) et **activités récentes réelles** (avant : tableau codé en dur, corrigé le 2026-08-01).
- `activities` — CRUD Activity, filtrable par `?type=` (les entrées sidebar "Croisades/Marchés/Pop-croisade/One-to-one" pointent vers ces filtres plutôt que vers des pages dédiées).
- `events` — **nouveau**, CRUD complet (titre, type, dates, lieu, capacité, image, mise en avant) ; alimente directement `/events` et `/events/[slug]`.
- `campaigns` — **nouveau**, CRUD des campagnes de dons.
- `donations` — **nouveau**, liste + changement de statut manuel (confirmation don hors-ligne), avec impact automatique sur `Campaign.currentAmount`.
- `agents` — missionnaires (bug d'affichage corrigé, voir Problèmes connus).
- `admins` — comptes administrateurs (create/delete).
- `users` — **nouveau**, comptes DONOR/MEMBER avec activation/désactivation.
- `schools`, `registrations`, `attendance[/[eventId]]` — inchangés, déjà fonctionnels.
- `reports` — **nouveau**, exports CSV (dons, inscriptions, activités) avec filtre de période.
- `settings` — **nouveau**, profil admin connecté (nom, mot de passe).
- `login` — connexion.
- `/admin` (racine) — redirige vers `/admin/dashboard` (avant : page morte basée sur une session jamais alimentée).

**API** : `/api/admin/registrations/[id]/card`, `/api/health`, `/api/webhooks/fedapay`, plus les routes d'export CSV `/admin/reports/{donations,activities,registrations}` et `/admin/attendance/[eventId]/export`.

## Sécurité — ⚠️ point corrigé le 2026-08-01
**`/admin/*` n'avait aucune protection d'authentification** : `admin/layout.tsx` affichait sidebar + contenu à quiconque connaissait l'URL, connecté ou non (seul l'affichage du nom admin était conditionnel). Corrigé par l'ajout de **`src/middleware.ts`** : bloque toute requête vers `/admin/:path*` (sauf `/admin/login`) si le cookie `admin_token` n'a pas la valeur `"authorized"`, et redirige vers `/admin/login`. Couvre à la fois les pages et les Server Actions (qui POSTent vers l'URL de la page d'origine) et les routes d'export CSV.

Reste à améliorer (mineur, non bloquant) : la page `/admin/login` est toujours techniquement rendue à l'intérieur du layout admin (donc partage le même arbre de composants), même si le middleware empêche d'y arriver avec du contenu sensible avant connexion.

## Server actions (`src/actions/`)
- `activity-actions.ts` — CRUD Activity
- `admin-actions.ts` — notifications, recherche admin, **assignation dons↔écoles — BUG TOUJOURS PRÉSENT** : `getAvailableDonations`, `assignDonationsToSchool`, `getSchoolDonationsHistory` référencent `Donation.schoolId`, champ absent du schéma Prisma. Plante à l'exécution si utilisé (non lié au nouveau CRUD `/admin/donations`, qui n'en dépend pas).
- `admin-management-actions.ts` — `getAdmins`, `createAdmin`, `deleteAdmin`, **+ `getCurrentAdminProfile`/`updateAdminProfile`** (nouveau, pour `/admin/settings`).
- `admin-agent-actions.ts` / `agent-actions.ts` — **toujours deux implémentations divergentes de `getAgents()`** (non réconciliées, risque connu, cf. Problèmes connus).
- `admin-events-actions.ts` — **nouveau** : CRUD Event (slug auto-généré + dédupliqué).
- `admin-campaigns-actions.ts` — **nouveau** : CRUD Campaign.
- `admin-donations-actions.ts` — **nouveau** : `getDonations`, `getDonationStats`, `updateDonationStatus` (incrémente/décrémente `Campaign.currentAmount` en cohérence avec le webhook FedaPay).
- `admin-users-actions.ts` — **nouveau** : `getCommunityUsers`, `toggleUserActive` (rôles DONOR/MEMBER).
- `attendance.ts` — sessions de présence, scan QR, présence manuelle, stats.
- `auth.ts` — login admin (DB puis fallback env vars) / agent (DB), logout, `isUserAuthenticated`, `getCurrentAdminName`, `getCurrentAdminId`.
- `community.ts` — inscription événement, candidature bénévole, contact, prière.
- `dashboard.ts` — stats globales + distribution modules (GlobalStats/ModuleDistribution, éditables depuis le dashboard).
- `donations.ts` — création don + intégration FedaPay (flux public).
- `locale.ts`, `school-actions.ts` — inchangés.

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

**Vague 2 — Admin dashboard** : voir sections Routes/Sécurité/Server actions ci-dessus. Sidebar (`src/components/admin/sidebar.tsx`) réorganisée en sections avec surbrillance active, **passée de fond rouge plein à fond blanc + texte/icônes rouges** (dernier retour utilisateur).

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

## Git
Branche `main`. Travail de cette session (redesign public + dashboard admin + sécurité) encore à committer/pousser au moment de la rédaction de cette note.
