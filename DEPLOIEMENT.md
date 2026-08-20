# Mettre LiFAC en ligne

Guide de mise en production de la plateforme LiFAC (Next.js 16 + Prisma + PostgreSQL Neon).

---

## 1. Ce qu'il faut avoir sous la main

| Élément | Où l'obtenir | Statut actuel |
|---|---|---|
| Base de données PostgreSQL | [Neon](https://neon.tech) — déjà en place | ✅ opérationnelle |
| Clés FedaPay **live** | Dashboard FedaPay → Paramètres → API | ⚠️ actuellement en **sandbox** |
| Clé Resend | [resend.com](https://resend.com) → API Keys | ✅ configurée |
| Domaine vérifié dans Resend | Resend → Domains (DNS chez Hostinger) | ✅ vérifié |
| Cloudinary | [cloudinary.com](https://cloudinary.com) → Dashboard | ✅ configuré |
| Clé Groq (assistant IA) | [console.groq.com](https://console.groq.com) | ✅ configurée |
| Nom de domaine | Hostinger | ✅ possédé |

---

## 2. Choix de l'hébergement

**Recommandé : Vercel** — c'est l'éditeur de Next.js, le déploiement est natif, gratuit pour démarrer, avec HTTPS et CDN inclus. L'hébergement mutualisé Hostinger classique **ne convient pas** (il sert du PHP statique, pas une application Node.js avec rendu serveur).

Le domaine reste chez Hostinger : on modifie simplement les enregistrements DNS pour pointer vers Vercel.

---

## 3. Déploiement sur Vercel

### 3.1 Connecter le dépôt
1. Créer un compte sur [vercel.com](https://vercel.com) (connexion via GitHub).
2. **Add New → Project** → sélectionner le dépôt `Tedel12/lifac`.
3. Vercel détecte automatiquement Next.js — ne rien changer aux réglages de build.

### 3.2 Renseigner les variables d'environnement
Dans **Settings → Environment Variables**, ajouter (valeurs de production) :

```
DATABASE_URL              # URL Neon avec -pooler
DIRECT_DATABASE_URL       # URL Neon sans -pooler (migrations)
ADMIN_EMAIL
ADMIN_PASSWORD            # ⚠️ mot de passe fort, différent du dev
SESSION_SECRET            # chaîne aléatoire longue

FEDAPAY_ENVIRONMENT=live
FEDAPAY_PUBLIC_KEY        # clé pk_live_...
FEDAPAY_SECRET_KEY        # clé sk_live_...
FEDAPAY_WEBHOOK_SECRET
FEDAPAY_CALLBACK_URL=https://VOTRE-DOMAINE/donate/success

RESEND_API_KEY
EMAIL_FROM="LiFAC <noreply@lifac.org>"

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

GROQ_API_KEY

NEXT_PUBLIC_APP_URL=https://VOTRE-DOMAINE
NEXT_PUBLIC_APP_NAME=LiFAC
```

> **Ne jamais** committer ces valeurs dans le dépôt. Le fichier `.env` local reste local.

### 3.3 Lancer le déploiement
Cliquer **Deploy**. Le premier build prend 2-4 minutes.

---

## 4. Brancher le domaine Hostinger

1. Dans Vercel : **Settings → Domains → Add** → saisir `lifac.org` (et `www.lifac.org`).
2. Vercel affiche les enregistrements DNS à créer.
3. Dans Hostinger : **Domaines → DNS / Serveurs de noms** → ajouter :
   - un enregistrement **A** pour `@` vers l'IP donnée par Vercel (`76.76.21.21` en général) ;
   - un enregistrement **CNAME** pour `www` vers `cname.vercel-dns.com`.
4. Attendre la propagation (de quelques minutes à quelques heures). Vercel génère le certificat HTTPS automatiquement.

> ⚠️ Ne pas supprimer les enregistrements DNS **TXT/MX de Resend** : ils servent à la vérification du domaine d'envoi et aux emails.

---

## 5. Base de données

Le schéma est déjà en place sur Neon. Deux points d'attention :

- **Les migrations de ce projet ont été appliquées manuellement** (l'endpoint direct Neon est injoignable depuis l'environnement de développement, voir `CONTEXT.md`). En production, `DIRECT_DATABASE_URL` sera joignable depuis Vercel : `npx prisma migrate deploy` devrait donc fonctionner normalement. La table `_prisma_migrations` n'existant pas encore, la première commande voudra rejouer tout l'historique — utiliser plutôt :
  ```bash
  npx prisma migrate resolve --applied <nom_de_chaque_migration_existante>
  ```
  pour marquer les migrations déjà appliquées, **avant** tout `migrate deploy`.
- Prévoir une **sauvegarde** : Neon propose des points de restauration automatiques (vérifier la rétention du plan utilisé).

---

## 6. Passer FedaPay en production

1. Dans le dashboard FedaPay, basculer en mode **Live** et récupérer les clés `pk_live_` / `sk_live_`.
2. Mettre à jour les variables sur Vercel (`FEDAPAY_ENVIRONMENT=live` + les deux clés).
3. Déclarer l'URL du webhook dans FedaPay :
   `https://VOTRE-DOMAINE/api/webhooks/fedapay`
   et copier le secret de webhook généré dans `FEDAPAY_WEBHOOK_SECRET`.
4. Faire **un vrai don test de petit montant** (100 XOF) via Mobile Money pour valider la chaîne complète : paiement → webhook → don marqué `APPROVED` → notification admin.

---

## 7. Vérifications avant d'annoncer le site

- [ ] Page d'accueil, activités, événements, à propos, ressources, témoignages, contact : toutes s'affichent
- [ ] Formulaire de contact → email bien reçu sur `info@lifac.org`
- [ ] Candidature bénévole → email reçu + candidature visible dans `/admin/agents`
- [ ] Témoignage soumis → email reçu + validation possible dans `/admin/testimonials`
- [ ] Don test réel (petit montant) confirmé de bout en bout
- [ ] Connexion admin (`/admin/login`) avec le **nouveau** mot de passe de production
- [ ] Connexion missionnaire et évangéliste
- [ ] Assistant IA répond
- [ ] Site correct sur mobile

---

## 8. Points de sécurité à traiter avant l'ouverture au public

1. **Changer `ADMIN_PASSWORD`** — ne pas réutiliser le mot de passe de développement.
2. **Supprimer ou désactiver les comptes de démo** (`evangeliste@lifac.org`, comptes missionnaires de test) une fois les vrais comptes créés.
3. **`.env.example` contient de vraies chaînes de connexion Neon** committées dans l'historique Git (voir `CONTEXT.md`). Avant l'ouverture : faire tourner les identifiants Neon et nettoyer le fichier.
4. Vérifier que les variables sensibles ne sont **jamais** préfixées `NEXT_PUBLIC_` (celles-ci sont exposées au navigateur).

---

## 9. Mises à jour ultérieures

Chaque `git push` sur la branche `main` déclenche automatiquement un nouveau déploiement Vercel. En cas de problème, Vercel permet de revenir à un déploiement précédent en un clic (**Deployments → ... → Promote to Production**).
