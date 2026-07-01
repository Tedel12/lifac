# LiFAC — Plateforme

> **Light For All Center** — Plateforme d'évangélisation et d'action humanitaire au Bénin.

Site institutionnel + plateforme de dons + gestion d'événements et de bénévoles.
Stack : **Next.js 15** + **Prisma 6** + **PostgreSQL** + **FedaPay** (Mobile Money / cartes).

---

## 🚀 Déploiement Vercel — Guide pas-à-pas

### Étape 1 — Créer la base de données

**Option A : Neon (recommandée, gratuit)**

1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un projet → région **eu-central-1** (Europe, plus proche du Bénin que les régions US)
3. Dans le dashboard Neon, allez dans **Connection Details**
4. Récupérez **deux** connection strings :
   - **Pooled** (avec `-pooler` dans le hostname) → ce sera votre `DATABASE_URL`
   - **Direct** (sans `-pooler`) → ce sera votre `DIRECT_DATABASE_URL`

**Option B : Vercel Postgres**

1. Dans le dashboard Vercel → **Storage** → **Create Database** → **Postgres**
2. Vercel injecte automatiquement les variables `POSTGRES_*` dans votre projet
3. ⚠️ Renommez `POSTGRES_PRISMA_URL` en `DATABASE_URL` et `POSTGRES_URL_NON_POOLING` en `DIRECT_DATABASE_URL`

### Étape 2 — Importer le projet sur Vercel

1. Poussez votre code sur **GitHub / GitLab / Bitbucket**
2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importez votre repo
3. Configuration auto-détectée :
   - Framework : **Next.js**
   - Build command : `prisma generate && next build` *(déjà dans `vercel.json`)*
   - Install command : `npm install`
   - Output directory : `.next` (auto)

### Étape 3 — Ajouter les variables d'environnement Vercel

Dans **Project Settings → Environment Variables**, ajoutez (Production + Preview + Development) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Neon **pooled** *(`...-pooler...neon.tech?sslmode=require&pgbouncer=true`)* |
| `DIRECT_DATABASE_URL` | URL Neon **direct** *(sans `-pooler`)* |
| `NEXTAUTH_SECRET` | Générer avec `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://votre-projet.vercel.app` (ou domaine custom) |
| `FEDAPAY_ENVIRONMENT` | `sandbox` (ou `live` en prod réelle) |
| `FEDAPAY_PUBLIC_KEY` | `pk_sandbox_...` ou `pk_live_...` |
| `FEDAPAY_SECRET_KEY` | `sk_sandbox_...` ou `sk_live_...` |
| `FEDAPAY_WEBHOOK_SECRET` | `whsec_...` (cf. étape 5) |
| `FEDAPAY_CALLBACK_URL` | `https://votre-projet.vercel.app/donate/success` |
| `NEXT_PUBLIC_APP_URL` | `https://votre-projet.vercel.app` |

### Étape 4 — Premier déploiement et migration de la base

1. Cliquez sur **Deploy** → le build doit passer (Prisma génère le client automatiquement via `postinstall`)
2. **Une fois le 1er déploiement réussi**, exécutez les migrations Prisma sur la BDD distante :

   **Méthode A — depuis votre machine locale** :
   ```bash
   # Créez un .env.local avec les vraies URLs Neon
   DATABASE_URL="..." DIRECT_DATABASE_URL="..." npx prisma db push
   DATABASE_URL="..." DIRECT_DATABASE_URL="..." npx tsx prisma/seed.ts
   ```

   **Méthode B — via Vercel CLI** :
   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.production.local
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. Ouvrez votre URL Vercel → la landing s'affiche avec les données seedées 🎉

### Étape 5 — Configurer le webhook FedaPay

1. Dans le dashboard FedaPay → **Paramètres → Webhooks** → **Créer**
2. URL : `https://votre-projet.vercel.app/api/webhooks/fedapay`
3. Sélectionnez les événements :
   - `transaction.approved`
   - `transaction.declined`
   - `transaction.canceled`
   - `transaction.refunded`
4. Copiez le **secret webhook** (`whsec_...`) → mettez-le dans `FEDAPAY_WEBHOOK_SECRET` sur Vercel
5. **Redéployez** (le changement de variable d'env nécessite un nouveau build)

### Étape 6 — Vérifications post-déploiement

- ✅ `https://votre-projet.vercel.app/api/health` retourne `{"status":"ok","database":"connected"}`
- ✅ `https://votre-projet.vercel.app/api/webhooks/fedapay` répond `200` en GET
- ✅ La page d'accueil affiche les stats et campagnes seedées
- ✅ Faire un don de test (1000 FCFA) en mode sandbox → vérifier le webhook dans les logs Vercel

---

## 🛠️ Développement local

### Prérequis
- Node.js ≥ 20
- PostgreSQL local OU compte Neon
- Compte FedaPay sandbox

### Installation

```bash
git clone <repo>
cd lifac-platform
npm install                    # installe + génère le client Prisma (postinstall)
cp .env.example .env.local     # remplir les valeurs
npm run db:push                # crée les tables
npm run db:seed                # données de démo
npm run dev                    # http://localhost:3000
```

### Compte admin de démo
- Email : `admin@lifac.org`
- Mot de passe : `Admin@LiFAC2026!` *(à changer dès le 1er login)*

### Tester le webhook FedaPay en local

Le webhook nécessite une URL publique. Utilisez **ngrok** :

```bash
ngrok http 3000
# Copiez l'URL https générée → configurez dans le dashboard FedaPay :
# https://abc123.ngrok.io/api/webhooks/fedapay
```

---

## 📜 Scripts npm

| Commande | Description |
|---|---|
| `npm run dev` | Serveur dev (Turbopack) |
| `npm run build` | Build de production (génère Prisma + Next) |
| `npm run start` | Lance le serveur de prod |
| `npm run db:push` | Synchronise le schéma sans migration (dev only) |
| `npm run db:migrate` | Applique les migrations en prod |
| `npm run db:migrate:dev` | Crée + applique une migration en dev |
| `npm run db:seed` | Insère les données de démo |
| `npm run db:studio` | Interface graphique Prisma |
| `npm run vercel-build` | Commande exécutée par Vercel au build |

---

## 🏗️ Architecture

```
┌─────────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Navigateur web /   │      │  Vercel          │      │  Neon Postgres  │
│  appli mobile       │◄────►│  Next.js 15      │◄────►│  (eu-central-1) │
└─────────────────────┘      │  Server Actions  │      └─────────────────┘
                             │  API Routes      │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │     FedaPay      │
                             │ (Mobile Money +  │
                             │  cartes XOF)     │
                             └──────────────────┘
```

### Flux d'un don
1. Donateur remplit `/donate` → Server Action `createDonation()`
2. Création `Donation` (statut `PENDING`) + référence `LIFAC-YYYYMMDD-XXXXX`
3. Appel FedaPay → URL de paiement hébergée
4. Donateur paie sur FedaPay (MTN, Moov, ou carte)
5. FedaPay → webhook `/api/webhooks/fedapay` (HMAC vérifié)
6. Webhook met à jour `Donation` + incrémente la campagne + génère reçu

---

## 🗂️ Structure

```
lifac-platform/
├── prisma/
│   ├── schema.prisma         # Schéma BDD (17 modèles)
│   └── seed.ts               # Données de démo
├── public/                   # Assets statiques
├── src/
│   ├── actions/              # Server Actions (logique métier)
│   ├── app/                  # Pages App Router
│   │   ├── api/health/       # Healthcheck Vercel
│   │   ├── api/webhooks/fedapay/  # Webhook FedaPay
│   │   └── ...
│   ├── components/
│   │   ├── ui/               # Primitives shadcn-style
│   │   ├── layout/           # Header / Footer / Logo
│   │   ├── sections/         # Sections de la landing
│   │   └── forms/            # Formulaires (don, contact...)
│   └── lib/                  # prisma, fedapay, utils, validations
├── .env.example
├── next.config.ts            # Config Next.js + serverExternalPackages
├── package.json              # Avec postinstall: prisma generate
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json               # Config Vercel (régions, timeouts)
└── .vercelignore
```

---

## 🔒 Sécurité

- ✅ Headers HTTP de sécurité (HSTS, X-Frame-Options, etc.)
- ✅ Validation côté serveur de toutes les entrées (Zod)
- ✅ Vérification HMAC stricte des webhooks (`timingSafeEqual`)
- ✅ Stockage des montants en `BigInt` (centimes) — pas d'erreur de virgule flottante
- ✅ Idempotence sur les webhooks via `paymentTransaction.fedapayEventId`
- ✅ `runtime = "nodejs"` + `dynamic = "force-dynamic"` sur le webhook
- ✅ Pas de cache sur `/api/webhooks/*`

---

## 📋 Roadmap

### À implémenter ensuite
- [ ] **NextAuth 5** : compléter `auth.ts` + adapter Prisma
- [ ] **Tableaux de bord** : `/dashboard/donor` + `/dashboard/admin` (CRUD campagnes/événements)
- [ ] **Reçus PDF** : génération automatique avec @react-pdf/renderer
- [ ] **Resend** : email de confirmation de don sur webhook APPROVED
- [ ] **Cloudinary** : upload des images de campagnes
- [ ] **Tests** : Vitest sur Server Actions, Playwright E2E sur le tunnel de don
- [ ] **Sentry** : monitoring d'erreurs en production

### Améliorations UX
- [ ] Skeleton loaders sur les listes
- [ ] Mode sombre
- [ ] Animations Framer Motion
- [ ] PWA
- [ ] Open Graph dynamique par campagne

---

## ❓ Troubleshooting Vercel

### Le build échoue avec "Can't reach database server"
→ Vérifiez que `DATABASE_URL` est bien configurée dans **Production** ET **Preview** sur Vercel.
→ Vous pouvez désactiver l'accès BDD au build : toutes les pages sont déjà en `dynamic = "force-dynamic"`, donc Next ne tente PAS de pré-rendre au build.

### Le webhook FedaPay reçoit 401 "Signature invalide"
→ Vérifiez que `FEDAPAY_WEBHOOK_SECRET` correspond exactement au secret affiché dans FedaPay (sans guillemets).
→ Vérifiez l'horloge système : si l'écart timestamp serveur/FedaPay > 5 min, la signature est rejetée.

### "Prisma Client validation error" en prod
→ Lancez `npm run db:push` ou `npm run db:migrate` après chaque changement de `schema.prisma`.
→ Si vous utilisez Neon : vérifiez que `DIRECT_DATABASE_URL` est défini (sans `-pooler`).

### "Too many connections" en production
→ Sur Neon, utilisez bien la connection string **pooled** (avec `pgbouncer=true&connection_limit=1` dans l'URL).
→ Vercel fonctions en serverless créent une connexion par invocation : le pooler Neon est obligatoire.

### La page de don affiche des données obsolètes
→ Toutes les pages avec accès BDD sont en `force-dynamic` — elles ne sont jamais cachées.
→ Si malgré tout vous observez du cache : vérifiez que vous n'avez pas de CDN tiers entre Vercel et l'utilisateur.

---

## 📄 Licence

Propriété de **Light For All Center (LiFAC)**.
Toute réutilisation hors du cadre du ministère LiFAC nécessite une autorisation écrite.

## 📧 Contact

- Technique : `tech@lifac.org`
- Dons et partenariats : `contact@lifac.org`
