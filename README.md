# Brain Cube — Jeu interactif Three.js

Jeu de puzzle 3D de type Bloxorz : faites rouler un bloc rectangulaire sur une grille suspendue pour l'amener **debout** dans la case cible, en un minimum de déplacements.

## Fonctionnalités

- **8 niveaux** de difficulté progressive (mouvement → cases fragiles → switchs → ponts)
- **Système de vies** : 3 vies, perdez-en une par chute, regagnez-en une par niveau réussi
- **Score** calculé selon le niveau et le nombre de déplacements
- **Leaderboard** global via API Symfony
- **Sound Design** synthétisé (Web Audio API) : bruitages + musique de fond
- **Interface d'authentification** : connexion / inscription ou mode invité
- Transitions de fond par niveau, animations de roulement avec pivot physique

## Prérequis

- Node.js ≥ 18
- (Optionnel) Back-end Symfony sur `http://localhost:8000` pour les scores

## Installation

```bash
npm install
```

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement → http://localhost:5173 |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérification qualité du code (ESLint) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

## Contrôles

| Touche | Action |
|---|---|
| ↑ ↓ ← → | Déplacer le bloc |
| R | Recommencer le niveau |
| M ou Echap | Ouvrir / fermer le menu pause |
| N | Niveau suivant (écran victoire) |

## Gameplay

### Objectif

Faire rouler le bloc 2x1x1 jusqu'à la case objectif (rose) en terminant le niveau avec le moins de déplacements possible.

### Boucle de jeu

1. Sélection d'un niveau depuis le menu principal.
2. Déplacement du bloc avec les flèches.
3. Interaction avec les plateformes spéciales (fragiles, switchs, ponts).
4. Victoire si le bloc arrive debout sur la case objectif.
5. Défaite locale en cas de chute, puis relance du niveau.
6. Progression vers le niveau suivant avec mise à jour du score et du leaderboard.

### Économie de jeu

- Économie principale: score basé sur le niveau, les déplacements et le temps.
- Économie secondaire: système de vies (perte sur chute, gain à la réussite d'un niveau).

## Structure du projet

```
front/
├── .github/workflows/ci.yml   # CI : lint + tests E2E
├── tests/e2e.spec.js          # Tests end-to-end Playwright
├── playwright.config.js       # Config Playwright
├── eslint.config.js           # Config ESLint
├── index.html                 # Point d'entrée HTML + HUD
├── main.js                    # Scène Three.js, logique du jeu
├── INTENTION.md               # Note d'intention / game design
└── package.json
```

## Types de cases

| Couleur | Type | Description |
|---|---|---|
| Blanc crème | Normal | Case standard |
| Orange doux | Fragile | S'effondre si le bloc est debout |
| Cyan | Switch léger | Active/désactive un pont au contact |
| Lavande | Switch lourd | Activé uniquement si le bloc est debout (STANDING) |
| Vert | Pont | Segment créé par un switch |
| Rose | Objectif | Case cible — le bloc doit arriver debout |

## Plateformes et interactions

### Plateforme normale

Surface stable, aucun effet spécial.

### Plateforme fragile

La case ne supporte pas le bloc en position debout.

### Plateforme switch léger

S'active au simple contact et peut déclencher l'apparition/disparition de ponts.

### Plateforme switch lourd

S'active uniquement si le bloc est debout sur la case.

### Plateforme pont

Tuile dynamique générée ou supprimée par des switchs selon l'état du niveau.

## Note d'intention

Voir [INTENTION.md](INTENTION.md) pour l'explication complète des choix de game design.
