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