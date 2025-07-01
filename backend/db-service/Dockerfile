# Utilise l'image officielle Node.js LTS
FROM node:latest

# Définit le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm i

# Copie le reste du code source
COPY . .

# Expose le port utilisé par ton serveur (à adapter si besoin)
EXPOSE 3000

# Définit la commande de démarrage, on attend la DB, puis migration, puis démarrage
CMD ["/bin/sh", "-c", "node wait-for-db.js && npm run migrate && npm start"]