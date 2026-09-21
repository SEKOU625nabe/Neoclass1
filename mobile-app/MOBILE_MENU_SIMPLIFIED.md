# 📱 NEOCLASS MOBILE - MENU SIMPLIFIÉ

## 🎯 Architecture: Bottom Navigation (5 Onglets)

```
┌─────────────────────────────────────┐
│         APPLICATION CONTENT          │  (80% hauteur)
│                                       │
├─────────────────────────────────────┤
│ 🏠  📚  🤖  🏆  👤  BOTTOM NAV (20%) │
└─────────────────────────────────────┘
```

---

## 📋 LES 5 ONGLETS PRINCIPAUX

### **1️⃣ 🏠 ACCUEIL (Dashboard)**
**Visible**: Tous les rôles
**Contenu**:
- Bienvenue personnalisée
- Stats rapides (pour étudiant: notes, rank, coins)
- Actions rapides
- Notifications récentes

---

### **2️⃣ 📚 APPRENTISSAGE**
**Student**:
- 📚 Mes Cours
- ✅ Quizzes
- 📺 Cours Live
- 📚 Bibliothèque

**Teacher**:
- 📚 Catalogue Cours
- 📁 Mes Cours
- 🤖 Exercices IA
- 📺 Cours Live

**School Admin**:
- 📁 Gestion Courses
- 📚 Bibliothèque
- 📝 Devoirs

**Parent**:
- 📈 Progression enfant
- 📋 Rapports

**Admin**:
- 📁 Gestion Contenu

---

### **3️⃣ 🤖 DARX IA**
**Visible**: Tous (adapté par rôle)
**Contenu**:
- 📸 Aide Devoirs (photo)
- 🧠 Plan d'Étude
- 📝 Fiches Révision
- 🃏 Flashcards
- 🔮 Prédiction Notes
- 🎤 Analyse Vocale

---

### **4️⃣ 🏆 RÉCOMPENSES**
**Student**:
- 🏆 Classement
- 💰 NabeCoins
- 🛒 Boutique
- 🏅 Certificats
- 🎯 Défis

**Teacher**:
- 💰 Mes Gains
- 👨‍🏫 Tutoring
- 🏪 Marketplace

**School**:
- 💰 Finances
- 💳 Paiements

**Parent**:
- (Caché)

**Admin**:
- 💰 Finances complètes

---

### **5️⃣ 👤 PROFIL**
**Contenu** (adapté):
- 👤 Mon Profil
- ⚙️ Paramètres
- 🔒 Sécurité
- 🌙 Thème
- 🔐 Authentification
- ⚡ À propos
- 🚪 Déconnexion

---

## 🔄 NAVIGATION ENTRE ONGLETS

```javascript
const BOTTOM_MENU = {
  'home': { icon: '🏠', label: 'Accueil', color: '#6c63ff' },
  'learning': { icon: '📚', label: 'Apprentissage', color: '#8b83ff' },
  'ai': { icon: '🤖', label: 'DARX IA', color: '#f59e0b' },
  'rewards': { icon: '🏆', label: 'Récompenses', color: '#10b981' },
  'profile': { icon: '👤', label: 'Profil', color: '#ef4444' }
};
```

---

## 📊 RÉDUCTION PAR RÔLE

| Rôle | Avant | Après | Réduction |
|------|-------|-------|-----------|
| **Student** | 67 items | 22 items | -67% |
| **Teacher** | 25 items | 12 items | -52% |
| **School** | 36 items | 15 items | -58% |
| **Parent** | 5 items | 5 items | 0% |
| **Admin** | 12 items | 8 items | -33% |
| **TOTAL** | 145 items | 62 items | -57% |

---

## 💾 STOCKAGE LOCAL

```javascript
// localStorage keys
'neo_mobile_menu_state' // Onglet actuel
'neo_mobile_favorites' // Favoris utilisateur
'neo_mobile_theme' // Light/Dark
'neo_mobile_language' // FR/AR/EN
```

---

## 🎨 STYLES BOTTOM NAV

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  color: var(--text-secondary);
}

.nav-item.active {
  color: var(--primary);
}

.nav-icon { font-size: 1.5rem; }
.nav-label { font-size: 0.75rem; font-weight: 500; }
```

---

## 🔀 MIGRATION WEB → MOBILE

**Web (Neoclass3.html)**: Menu complet 160+ items
**Mobile (index.html)**: Menu simplifié 5 onglets

**Synchronisation Firebase**:
- Même base de données
- Même authentification
- Données en sync temps réel

---

## 🚀 DÉPLOIEMENT

1. ✅ Android: APK/AAB
2. ✅ iOS: IPA
3. ✅ Web: Neoclass3.html (inchangé)

**Tous connectés à la même Firebase**
