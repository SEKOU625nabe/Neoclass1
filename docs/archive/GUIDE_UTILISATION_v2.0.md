# 📚 NEOCLASS – GUIDE COMPLET DES NOUVELLES FONCTIONNALITÉS v2.0

## 🎯 Vue d'ensemble

Votre plateforme Neoclass dispose maintenant d'un **système de gestion scolaire complet** incluant :

### ✅ Nouvelles Fonctionnalités

1. **Gestion des Classes** - Créer, modifier, supprimer les classes
2. **Gestion des Élèves** - Profil complet avec photos, notes, bulletins
3. **Configuration des Bulletins** - Template personnalisé avec logo, couleurs, signatures
4. **Gestion des Professeurs** - Ajouter professeurs avec photos et matières
5. **Gestion des Dirigeants** - Directeur, sous-directeur, cadres
6. **Publication des Notes** - Envoi automatique à tous les élèves
7. **Inscription Élève Améliorée** - Photo obligatoire + infos parents

---

## 🏫 PARTIE ÉCOLE – Menu Principal

Accédez à toutes les fonctionnalités via le **menu latéral (Sidebar)** :

### Menu d'Administration École

```
🎓 Neoclass – École
├── 📚 Mes Élèves (voir tous les élèves inscrits)
├── 🏫 Gestion Classes (créer/modifier classes)
├── 👨‍🏫 Professeurs (ajouter professeurs)
├── 🎓 Dirigeants (directeur, cadres)
├── 📝 Bulletins (voir/valider bulletins)
├── 🎨 Config Bulletins (personnaliser modèle)
├── 📊 Résultats (voir résultats des élèves)
└── ⚙️ Paramètres École
```

---

## 1️⃣ GESTION DES CLASSES

### 📋 Créer une Classe

1. Allez dans **🏫 Gestion Classes**
2. Cliquez sur **+ Créer une classe**
3. Remplissez :
   - **Nom** : Ex: "6ème A", "Terminale S"
   - **Niveau** : 6ème, 5ème, 4ème, etc.
   - **Description** : Ex: "Classe du matin, 35 élèves"
   - **Professeur principal** : (optionnel)
4. Cliquez **✅ Créer la classe**

### 👥 Voir les Élèves d'une Classe

1. Dans **🏫 Gestion Classes**
2. Cliquez sur une classe
3. Vous verrez :
   - 📊 Nombre d'élèves
   - 🔍 Barre de recherche pour filtrer
   - 📋 Liste avec photos et statuts
4. **Actions possibles :**
   - 👁️ Cliquez sur un élève → Voir son profil complet
   - 🚫 Renvoyer un élève (le marquer comme "Renvoyé")
   - ♻️ Réintégrer un élève

### ✏️ Modifier une Classe

1. Cliquez sur le bouton **✏️ Modifier**
2. Changez les infos (nom, description, prof principal)
3. Cliquez **💾 Sauvegarder**

---

## 2️⃣ GESTION DES ÉLÈVES

### 🎓 Inscrire un Élève

#### Méthode 1 : Via l'interface École
1. Allez dans **📚 Mes Élèves**
2. Remplissez le **formulaire d'inscription** (gauche)
3. **Étapes :**
   - 📷 Ajouter une **photo de profil** (obligatoire)
   - 📝 Prénom et Nom
   - 🏫 Classe
   - 👨‍👩‍👧 Infos parent (nom, téléphone, email)
4. Cliquez **✅ Inscrire**
5. Vous recevrez :
   - 📧 Email de l'élève
   - 🆔 Identifiant unique
   - 🔒 Mot de passe temporaire

#### Méthode 2 : Page d'inscription dédiée
1. Ouvrez **neoclass-student-registration.html**
2. C'est une page d'inscription **complète avec photo obligatoire**
3. 3 étapes :
   - 📷 Photo de profil
   - 📚 Infos élève
   - 👨‍👩‍👧 Infos parent

### 👁️ Voir le Profil Complet d'un Élève

1. Allez dans **🏫 Gestion Classes** → Classe → Élève
2. Cliquez **👁️ Profil**
3. Vous verrez :
   - 📷 Photo de profil
   - 👨‍👩‍👧 Infos parents (nom, téléphone, email)
   - 📊 Tous les bulletins et résultats
   - 📝 Notes détaillées par période
   - 📌 Statut (Actif / Renvoyé)

### 🚫 Renvoyer/Réintégrer un Élève

1. Ouvrez le profil de l'élève
2. Cliquez **🚫 Renvoyer** (ajoutez une raison)
3. L'élève apparaît comme "RENVOYÉ"
4. Pour réintégrer : **♻️ Réintégrer**

---

## 3️⃣ CONFIGURATION DES BULLETINS

### 🎨 Personnaliser le Modèle de Bulletin

Allez dans **🎨 Config Bulletins** pour configurer :

#### 🏫 Identité de l'École
- 📷 **Logo** (image de l'école)
- 🎨 **Couleur principale** (choisissez avec le color picker)
- 📝 **Nom complet** de l'école
- 📍 **Adresse**
- 📞 **Téléphone**

#### ✍️ Signatures
- 📝 **Nom du Directeur**
- 👤 **Signature numérique du Directeur** (image/scan)
- 🏢 **Cachet/Tampon de l'école** (image)

#### 📚 Matières & Coefficients
- Les matières sont gérées dans **⚙️ Config Notes**
- Elles apparaissent automatiquement dans le bulletin

### 📄 Voir un Bulletin Généré

1. Allez dans **📚 Mes Élèves** → Classe → Élève
2. Cliquez **📄 Voir le bulletin** (après publication des notes)
3. Le bulletin affiche :
   - 🏫 Logo et infos de l'école
   - 👤 Photo et infos de l'élève
   - 📊 Tableau de notes
   - 📈 Moyenne générale
   - ✍️ Signatures

### ✅ Vérifier avant Imprimer

1. Cliquez **✅ Vérifier puis Imprimer**
2. Vérifie :
   - ❌ Erreurs (nom école, etc.)
   - ⚠️ Avertissements (pas de logo, pas de signature)
3. Si OK → **🖨️ Imprimer**

---

## 4️⃣ GESTION DES PROFESSEURS

### ➕ Ajouter un Professeur

1. Allez dans **👨‍🏫 Professeurs**
2. Remplissez :
   - 📷 **Photo** (cliquez sur l'avatar)
   - 👤 **Nom complet**
   - 📧 **Email**
   - 📞 **Téléphone**
   - 📚 **Matière(s)** : Ex: "Mathématiques, Physique"
   - 🏫 **Classe principale**
3. Cliquez **Ajouter ✅**

### 🔍 Rechercher un Professeur

- Utilisez la **barre de recherche** pour trouver par :
  - Nom
  - Email
  - Matière

### ✏️ Modifier un Professeur

1. Cliquez sur le professeur
2. Changez les informations
3. Cliquez **💾 Sauvegarder**

### 🗑️ Supprimer un Professeur

1. Cliquez **🗑️** (bouton rouge)
2. Confirmez la suppression

---

## 5️⃣ GESTION DES DIRIGEANTS

### ➕ Ajouter un Cadre (Directeur, Sous-directeur, etc.)

1. Allez dans **🎓 Dirigeants**
2. Remplissez :
   - 📷 **Photo**
   - 👤 **Nom complet**
   - 📍 **Poste** :
     - Directeur
     - Sous-directeur
     - Chef de cycle
     - Coordonnateur pédagogique
   - 📧 **Email**
   - 📞 **Téléphone**
3. Cliquez **Ajouter ✅**

### 📋 Voir les Cadres

- Tous les cadres sont affichés avec :
  - 📷 Photo
  - 👤 Nom et poste
  - 📧 Email

---

## 6️⃣ PUBLICATION DES NOTES

### 📊 Publier les Résultats d'une Classe

1. Allez dans **📝 Bulletins** (ou **📊 Résultats**)
2. Sélectionnez la **classe** et la **période** (T1, T2, T3)
3. Calculez les moyennes
4. Cliquez **🚀 Publier les résultats**

### 📨 Envoyer les Notes à Tous les Élèves

1. **Avant publication :** Vérifiez qu'il n'y a pas d'erreurs
2. Cliquez **📨 Envoyer les notes**
3. Choisissez le trimestre
4. **Aperçu :** Vérifiez les élèves qui recevront les notes
5. **Confirmez** l'envoi

### ✅ Ce qui se Passe Après l'Envoi

- ✅ Chaque élève reçoit une **notification in-app**
- 📧 (Optionnel) Email parent si configuré
- 📄 Le bulletin devient accessible dans l'app
- 📊 Les résultats sont visibles dans le profil

---

## 🔗 LIENS IMPORTANTS

### Pour les Élèves

- **Inscription :** `neoclass-student-registration.html`
- **Connexion :** `index.html` → Onglet Élève
- **Accueil :** Voir résultats, bulletins, messages

### Pour l'École

- **Admin :** `index.html` → Se connecter en tant qu'École
- **Accueil :** Menu avec toutes les sections

### Fichiers Techniques

- **Main App :** `public/index.html`
- **School Module :** `neoclass-school-v2.js`
- **Styles :** `public/css/` (base.css, components.css, etc.)
- **Backend :** `server.js`, `security-middleware.js`

---

## 💡 CONSEILS & BONNES PRATIQUES

### ✅ Avant de Commencer

1. **Configurez d'abord le bulletin** 🎨
   - Logo, couleurs, signatures
   - Cela affecte tous les bulletins générés

2. **Créez les classes** 🏫
   - Niveaux et noms corrects
   - Un professeur principal par classe

3. **Ajoutez les professeurs** 👨‍🏫
   - Avec photos
   - Assignez-les aux classes

4. **Inscrivez les élèves** 🎓
   - Photo obligatoire
   - Email parent correct

5. **Publiez les notes** 📊
   - Après avoir calculé les moyennes
   - Vérifiez avant d'envoyer

### ⚠️ Points Importants

- 📷 **Photo élève obligatoire** pour l'inscription
- 📧 **Email parent correct** pour recevoir bulletins
- ✅ **Vérifier les notes** avant publication
- 📝 **Config bulletin d'abord** avant génération
- 🔒 **Sauvegarder les identifiants** des élèves

---

## 🆘 DÉPANNAGE

| Problème | Solution |
|----------|----------|
| Photo ne s'enregistre pas | Vérifiez le format (JPG, PNG, max 5MB) |
| Élève ne reçoit pas la notification | Vérifiez que l'email parent est correct |
| Bulletin vide/pas de notes | Publiez les résultats d'abord |
| Classe vide | Vérifiez que classId correspond |
| Erreur lors de l'envoi | Vérifiez la connexion internet |

---

## 📞 SUPPORT

- 📧 Email: support@neoclass.com
- 💬 Chat: Disponible dans l'app
- 📱 Hotline: +224 XXXX XXXX

---

**Bienvenue sur Neoclass! 🚀**
*Votre plateforme de gestion scolaire complète.*
