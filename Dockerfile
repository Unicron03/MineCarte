FROM node:alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
# Le .dockerignore sera respecté ici
COPY . .

# Construire l'application
RUN npm run build

# Commande de démarrage du serveur NextJS
CMD ["npm", "start"]

# CMD ["sh"]