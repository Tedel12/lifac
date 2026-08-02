# LiFAC — Dashboard Missionnaire (`/volunteer/*`)

> Plan en attente d'approbation. Ne rien exécuter avant le feu vert.

## Contexte

Après avoir remis à niveau le dashboard admin, l'utilisateur veut la même chose côté
missionnaires (bénévoles). En explorant `/volunteer/*`, l'état est comparable à ce qu'était
l'admin avant la précédente passe :

- `src/app/volunteer/dashboard/page.tsx` est une page vide ("Bienvenue...").
- La sidebar (`src/components/volunteer/sidebar.tsx`) liste 7 liens (`assignments`, `reports`,
  `converts`, `prayer`, `ai-assistant`, `profile` en plus de `dashboard`) dont **aucun n'a de
  page correspondante** — tous 404.
- **Aucune protection d'authentification** sur `/volunteer/*` (même trou que l'admin avait avant
  `src/middleware.ts`).
- **Impossible de savoir quel missionnaire est connecté** : `loginAgent()` (`src/actions/auth.ts`)
  ne pose que le cookie `admin_token="authorized_agent"`, sans identifiant — donc aucune page
  "mes X" n'est faisable tant que ce n'est pas corrigé (même pattern que `admin_id` ajouté pour
  les admins).
- Le pipeline de candidature bénévole est un cul-de-sac : `applyAsVolunteer()`
  (`src/actions/community.ts`) crée un `User` **sans mot de passe** + un `Volunteer` `PENDING`,
  mais aucune page admin ne permet de les examiner/approuver — ces candidatures restent bloquées
  indéfiniment.
- Le modèle `Activity` n'a pas de relation vers un missionnaire précis (`responsibleName` est un
  simple champ texte libre), donc "mes activités" n'est pas interrogeable tel quel.

Décisions validées avec l'utilisateur :
- Ajouter la relation manquante `Activity → User` (missionnaire assigné) via une petite migration.
- Garder "Assistant IA" dans le menu mais comme simple page "Bientôt disponible" (pas d'intégration IA cette passe).
- Ajouter une page admin de validation des candidatures bénévoles.

## Plan d'exécution

### 1. Fondations (identité + sécurité + schéma)
- **Migration Prisma** : `Activity.assignedToId String? @relation("ActivityAssignee", ...)` vers
  `User`, + relation inverse `User.assignedActivities Activity[]`. Garde `responsibleName` tel
  quel (affichage/legacy), `assignedToId` devient la source de vérité pour "mes activités".
- **`src/actions/auth.ts`** : `loginAgent()` pose en plus `agent_id` et `agent_display_name`
  (même pattern que `admin_id`/`admin_display_name` ajoutés pour les admins). Nouvelles
  fonctions `getCurrentAgentId()` / `getCurrentAgentName()`. `logoutAdmin()` (utilisé pour les
  deux rôles) efface aussi ces cookies.
- **`src/middleware.ts`** : étendre le matcher avec `/volunteer/:path+` (le `+` exige au moins un
  segment, donc `/volunteer` — le formulaire public de candidature — reste accessible sans
  connexion) et vérifier `admin_token === "authorized_agent"`, redirection vers `/admin/login`
  sinon (pas de page de connexion dédiée aux missionnaires — le sélecteur de rôle existe déjà
  dans `admin-login-form.tsx`).
- **`src/app/volunteer/layout.tsx`** : récupère `getCurrentAgentName()` et le passe à
  `AgentSidebar`, même pattern que `admin/layout.tsx` → `AdminSidebar`.
- **`src/components/admin/activity-modal.tsx`** + `src/actions/activity-actions.ts` : ajoute un
  sélecteur "Missionnaire responsable" (liste des `User` role VOLUNTEER, réutilise `getAgents()`)
  qui écrit `assignedToId` — sans ça, personne ne peut jamais être assigné à une activité et tout
  le reste de la fonctionnalité reste vide.

### 2. Nouvelles server actions (`src/actions/volunteer-actions.ts`)
Toutes scoping les données via `getCurrentAgentId()` :
- `getMyOverview()` — compte d'écoles assignées, activités à venir, décisions pour Christ
  cumulées : pour le dashboard.
- `getMySchools()` — `prisma.school.findMany({ where: { agentId } })`.
- `getMyActivities({ upcoming })` — `prisma.activity.findMany({ where: { assignedToId } })`,
  triable passé/à venir.
- `updateMyActivityOutcome(activityId, data)` — permet au missionnaire de renseigner
  `actualParticipants`, `decisionsForChrist`, `biblesDistributed`, `newContacts`, `notes` sur
  **ses propres** activités seulement (vérifie `assignedToId === currentAgentId` avant update).
- `getPrayerWall()` — liste des `PrayerRequest` publiques (`isPublic: true`), lecture seule.
- `getMyProfile()` / `updateMyProfile(data)` — nom, téléphone, mot de passe.

### 3. Pages missionnaire (`src/app/volunteer/*`), pattern cohérent avec l'admin (cartes blanches,
   accents rouges, header cohérent)
- `dashboard/page.tsx` — remplace le placeholder : stats rapides (écoles, activités à venir,
  impact cumulé) + raccourcis.
- `assignments/page.tsx` — **"Mes affectations"** : section Écoles assignées + section Activités
  à venir qui leur sont attribuées (les deux via les relations ci-dessus).
- `reports/page.tsx` — **"Rapports"** : leurs activités passées, avec un mini-formulaire pour
  compléter les résultats (`updateMyActivityOutcome`) — c'est le vrai flux "compte-rendu terrain".
- `converts/page.tsx` — **"Nouveaux convertis"** : pas de modèle `Convert` individuel (décision
  validée), donc vue agrégée des décisions pour Christ / nouveaux contacts par activité. Le
  libellé du menu reste tel quel mais le contenu de la page l'explicite clairement.
- `prayer/page.tsx` — mur de prière public en lecture seule (`getPrayerWall`).
- `ai-assistant/page.tsx` — page "Bientôt disponible" statique.
- `profile/page.tsx` — édition profil, même pattern que `/admin/settings`.

### 4. Sidebar missionnaire (`src/components/volunteer/sidebar.tsx`)
Actuellement fond bleu marine sans état actif. Alignée sur le nouveau langage visuel de la
sidebar admin (fond blanc, texte/icônes rouge LiFAC, item actif en surbrillance via
`usePathname()`), pour la cohérence visuelle établie dans la session précédente.

### 5. Validation des candidatures bénévoles (côté admin)
- **`src/actions/admin-agent-actions.ts`** : ajoute `getPendingApplications()` (jointure
  `Volunteer` où `status: PENDING` + `User`), `approveVolunteerApplication(id, password)` (hash
  le mot de passe, `Volunteer.status = APPROVED`, `User.isActive = true`),
  `rejectVolunteerApplication(id)` (`Volunteer.status = REJECTED`).
- **`/admin/agents`** : ajoute un onglet/section "Candidatures en attente" (badge avec le compte)
  au-dessus du tableau existant, avec un mini-modal "Approuver" qui demande un mot de passe à
  définir pour le nouveau missionnaire.

## Vérification
- `npx tsc --noEmit` après chaque étape.
- `npx prisma migrate dev` (ou generate) pour la nouvelle relation `Activity.assignedToId`.
- Smoke-test routes (`curl` avec/sans cookie `admin_token=authorized_agent`) : `/volunteer`
  (public, 200 sans cookie), `/volunteer/dashboard` (redirige vers `/admin/login` sans cookie,
  200 avec).
- Flux de bout en bout : soumettre une candidature via `/volunteer` → l'approuver depuis
  `/admin/agents` → se connecter avec le mot de passe défini → vérifier que le dashboard
  missionnaire affiche bien les données scoping sur ce compte.
- Assigner une activité à un missionnaire depuis `/admin/activities` (le formulaire devra gagner
  un sélecteur "Missionnaire responsable" branché sur `assignedToId`) → vérifier qu'elle apparaît
  dans `/volunteer/assignments` puis `/volunteer/reports` une fois passée.