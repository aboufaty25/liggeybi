#!/bin/bash

# Définissez le chemin du projet.
PROJECT_DIR="$(pwd)"
# Emplacement de la sauvegarde temporaire
BACKUP_DIR="/tmp/liggeybi_uploads_backup"

echo "🚀 Démarrage du déploiement..."

# 1. Sauvegarder le dossier uploads s'il contient des fichiers
if [ -d "$PROJECT_DIR/uploads" ]; then
    echo "📦 Sauvegarde du dossier uploads/ vers $BACKUP_DIR..."
    rm -rf "$BACKUP_DIR"
    cp -r "$PROJECT_DIR/uploads" "$BACKUP_DIR"
else
    echo "⚠️ Aucun dossier uploads/ trouvé à sauvegarder."
fi

# 2. Récupérer le code de GitHub
echo "⬇️  Téléchargement des modifications via git pull..."
cd "$PROJECT_DIR" || exit
git pull origin main

# 3. Restaurer le dossier uploads
if [ -d "$BACKUP_DIR" ]; then
    echo "🔄 Restauration du dossier uploads/..."
    cp -a "$BACKUP_DIR/." "$PROJECT_DIR/uploads/"
    rm -rf "$BACKUP_DIR"
else
    echo "⚠️ Aucune sauvegarde à restaurer pour le dossier uploads/."
fi

# 4. Installer les dépendances et builder
echo "📦 Installation des dépendances..."
npm install

echo "🔨 Build du projet..."
npm run build

echo "🔄 Redémarrage de l'application..."
# Commandes pour hostinger (par exemple pour redémarrer PM2 ou autre via Phusion Passenger)
# Si vous utilisez passenger (Hostinger / cPanel Node.js app):
mkdir -p "$PROJECT_DIR/tmp"
touch "$PROJECT_DIR/tmp/restart.txt"

echo "✅ Déploiement terminé !"
