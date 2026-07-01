# Déploiement Vercel corrigé

## Corrections appliquées

1. `vercel.json` a été simplifié : la configuration `functions` ne cible plus une page React (`src/app/donate/page.tsx`). Sur App Router, la durée d’exécution doit être déclarée dans le fichier avec `export const maxDuration = ...`.
2. `src/app/api/webhooks/fedapay/route.ts` contient maintenant `export const maxDuration = 30`.
3. `src/app/donate/page.tsx` contient maintenant `export const maxDuration = 15`.
4. `src/app/api/health/route.ts` contient maintenant `export const maxDuration = 10`.
5. `package.json` utilise un script `vercel-build` sûr : `prisma generate && next build`, sans `prisma migrate deploy`, car aucun dossier `prisma/migrations` n’est fourni dans le projet.
6. Le commentaire TypeScript de `fedapay.ts` est passé de `@ts-expect-error` à `@ts-ignore` pour éviter un échec du build si le paquet expose finalement ses propres types.

## Variables à ajouter dans Vercel avant le déploiement

Dans **Vercel > Project Settings > Environment Variables**, ajoute au minimum :

```env
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=une_cle_longue_aleatoire
NEXTAUTH_URL=https://ton-projet.vercel.app
NEXT_PUBLIC_APP_URL=https://ton-projet.vercel.app
FEDAPAY_ENVIRONMENT=sandbox
FEDAPAY_PUBLIC_KEY=pk_sandbox_...
FEDAPAY_SECRET_KEY=sk_sandbox_...
FEDAPAY_WEBHOOK_SECRET=whsec_...
FEDAPAY_CALLBACK_URL=https://ton-projet.vercel.app/donate/success
```

## Commandes locales de vérification

```bash
npm install
npm run build
```

Après le premier déploiement réussi, initialise la base :

```bash
vercel env pull .env.production.local
npx prisma db push
npx tsx prisma/seed.ts
```
