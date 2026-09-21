🔧 CORRECTIONS DES ERREURS
═════════════════════════════════════════════════════════════

❌ PROBLÈME
───────────────────────────────────────────────────────────

Quand vous ouvrez index.html directement:
- Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME
- Uncaught SyntaxError: Unexpected token 'export'
- firebase is not defined
- CORS errors
- manifest.json failed to load


✅ CAUSE
───────────────────────────────────────────────────────────

Vous ouvrez le fichier comme file:// au lieu de http://

Les navigateurs bloquent pour sécurité:
❌ file:///C:/Users/HP/Desktop/neoclass/mobile-app/www/index.html
✅ http://localhost:8000


✅ SOLUTION 1: SERVEUR NODE.JS (MEILLEURE)
───────────────────────────────────────────────────────────

Sur Windows:
1. Ouvrez terminal ou CMD
2. Allez au dossier:
   cd c:\Users\HP\Desktop\neoclass\mobile-app

3. Lancez le serveur:
   node server.js

   Vous verrez:
   ✅ Serveur local démarré sur http://localhost:8000
   📱 Ouvrez: http://localhost:8000

4. Ouvrez dans le navigateur:
   http://localhost:8000

5. Pour arrêter: Appuyez Ctrl+C

OU doublez-cliquez sur: dev.bat


RAPIDE AVEC BATCH FILE
───────────────────────────────────────────────────────────

Sur Windows:
1. Allez au dossier mobile-app
2. Doublez-cliquez: dev.bat
3. Le serveur démarre automatiquement
4. Ouvrez: http://localhost:8000

OU sur macOS/Linux:
chmod +x dev.sh
./dev.sh


✅ SOLUTION 2: ALTERNATIVE PYTHON
───────────────────────────────────────────────────────────

Si Python est installé:

Python 3:
cd c:\Users\HP\Desktop\neoclass\mobile-app\www
python -m http.server 8000

Python 2:
cd c:\Users\HP\Desktop\neoclass\mobile-app\www
python -m SimpleHTTPServer 8000

Puis: http://localhost:8000


✅ SOLUTION 3: EXTENSION VS CODE
───────────────────────────────────────────────────────────

Installez "Live Server" dans VS Code:
1. Extensions → Cherchez "Live Server"
2. Installez
3. Ouvrir index.html
4. Clic droit → "Open with Live Server"

Démarre automatiquement sur http://localhost:5500


✅ SOLUTION 4: CAPACITOR (POUR ANDROID)
───────────────────────────────────────────────────────────

Pour tester sur Android vrai:

1. npm install
2. npx capacitor add android
3. npx capacitor sync android
4. npx capacitor run android

C'est plus approprié pour mobile!


📝 RÉSUMÉ - CHOISISSEZ UNE SOLUTION:
───────────────────────────────────────────────────────────

POUR DÉVELOPPEMENT LOCAL:
→ Solution 1: node server.js (MEILLEURE)
→ Solution 2: dev.bat (PLUS FACILE)
→ Solution 3: Python (ALT)
→ Solution 4: VS Code Live Server (ALT)

POUR TESTER SUR ANDROID VRAI:
→ Solution 4: npx capacitor run android


🚀 DÉMARRAGE MAINTENANT
───────────────────────────────────────────────────────────

Windows:
1. Ouvrez CMD
2. cd c:\Users\HP\Desktop\neoclass\mobile-app
3. node server.js
4. Ouvrez: http://localhost:8000

macOS/Linux:
1. Ouvrez Terminal
2. cd ~/Desktop/neoclass/mobile-app
3. node server.js
4. Ouvrez: http://localhost:8000

Vous devriez voir:
✅ Splash screen (2 sec)
✅ Login page
✅ Pas d'erreurs console


💡 TIPS
───────────────────────────────────────────────────────────

- Restez sur http://localhost:8000 pour tester
- Appuyez F12 pour voir la console
- Appuyez F5 pour rafraîchir (ou Ctrl+Shift+R cache)
- Les fichiers se mettent à jour automatiquement
- Appuyez Ctrl+C pour arrêter le serveur


❓ TOUJOURS DES ERREURS?
───────────────────────────────────────────────────────────

1. Assurez-vous d'être sur http:// pas file://
2. Vérifiez que node server.js affiche "Serveur local démarré"
3. Ouvrez http://localhost:8000 (PAS index.html)
4. Appuyez Ctrl+Shift+R pour vider le cache
5. Vérifiez F12 Console pour erreurs


═════════════════════════════════════════════════════════════

PRÊT? Exécutez maintenant:
cd c:\Users\HP\Desktop\neoclass\mobile-app
node server.js

🎉
