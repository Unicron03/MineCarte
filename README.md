# Minecarte

[![CI](https://github.com/Unicron03/MineCarte/actions/workflows/ci.yml/badge.svg)](https://github.com/Unicron03/MineCarte/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Unicron03/MineCarte/graph/badge.svg?token=JF8E1KKJIB)](https://codecov.io/gh/Unicron03/MineCarte)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

## 📊 Coverage

Consulte la couverture de code sur [Codecov](https://codecov.io/gh/Unicron03/MineCarte)

## 🧪 Tests

### Unitaires

```bash
npm run test           # Tests unitaires
npm run test:coverage  # Tests avec couverture
```

### End-to-end (Playwright)

```bash
npx playwright install  # Installer l'utilitaire Playwright
npm test:e2e            # Tests end-to-end Playwright
```

## 🔧 Linter ESLint

```bash
npx eslint .
```

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

## Build des Tests

1. Installer artillery
```
npm install --save-dev artillery
```

2. Lancer le build
```
docker compose up --build -d
```

3. Lancer les textes :
- Test de stress PvP :
```
npx artillery run docs/stress-pvp.yml --output docs/report.json
```
- Test de reconnexion :
```
npx artillery run docs/stress-extreme.yml
```
- Test extrême (optionnel) :
```
npx artillery run docs/stress-extreme.yml
```

4. Générer le rapport HTML
```
node docs/generate-report.js docs/report.json docs/report-reconnect.json docs/index.html
```

