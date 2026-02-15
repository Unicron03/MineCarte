# Minecarte

[![CI](https://github.com/Unicron03/MineCarte/actions/workflows/ci.yml/badge.svg)](https://github.com/Unicron03/MineCarte/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Unicron03/MineCarte/graph/badge.svg?token=JF8E1KKJIB)](https://codecov.io/gh/Unicron03/MineCarte)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

## 📊 Coverage

Consulte la couverture de code sur [Codecov](https://codecov.io/gh/Unicron03/MineCarte)

## 🧪 Tests

```bash
npm run test           # Tests unitaires
npm run test:coverage  # Tests avec couverture
```

## 🔧 Linter ESLint

```bash
npx eslint .
```

# A REVOIR

Pour les combat multi-joeur il y a deux fichier important
- server.js
- src/app/game/page.tsx

Dans serveur.js des fonctions doivent être implémentées.
Modifier aussi dans server.js des socket.on si besoin.

Un petit problème: Quand un joueur quitte, l'autre n'est pas expulser, de même quand un joueur fais retour.

## Pour Merge et Push

Veuillez suivre ces instructions afin d'éviter de tout casser :
- Ajoutez vos fichier ```git add .```
- Commitez les fichiers ```git commit -m "La liste des changements effectués"```
- Mergez avec le dépôt ```git merge origin/main```
- Faire les fusions via l'éditeur de code (**PAS BESOIN DE *package-lock* CAR *package* puis ```npm install``` vont le recréer**)
- Ajoutez les fichiers fusionné ```git add .```
- Commitez les fichiers fusionné ```git commit -m "Fusion avec commit précèdent"```
- Envoyez sur le dépôt distant ```git push```

## Build du docker

1. Lancer le build
```
docker compose up --build -d
```

2. AU CHOIX :
- Initialiser la BDD **SANS** données de tests (compte fake, etc.) :
```
./init-build.bat
```
- Initialiser la BDD **AVEC** données de tests (compte fake, etc.) :
```
./init-build-test.bat
```