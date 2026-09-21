#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       NEOCLASS MOBILE - SERVEUR LOCAL                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Vérifie que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ ERREUR: Node.js n'est pas installé!"
    echo "Téléchargez depuis: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté"
echo ""
echo "🚀 Démarrage du serveur local..."
echo ""

# Démarre le serveur
node server.js
