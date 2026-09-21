# 🔧 INTÉGRATION DIRECTE DANS NEOCLASS3.HTML

## ÉTAPE 1: Ajouter les ressources

### A. Dans le `<head>` (après les autres `<link>`):

```html
<!-- 🎓 Course Management System -->
<link rel="stylesheet" href="./classroom-styles.css">
```

### B. Dans les scripts (avant la fermeture `</body>`):

```html
<!-- 🎓 Course Management System -->
<script src="./course-management-system.js" defer></script>
```

---

## ÉTAPE 2: Ajouter à la navigation

### Pour les Élèves - Dans le sidebar (section `learn`):

```javascript
// Dans getSidebarLinks(), section student
{icon:'🏫',label:'Salles de Classe',page:'classrooms'}
```

### Code complet à ajouter:

```javascript
// Dans le groupe 'learn' des items
{icon:'🏫',label:'Salles de Classe',page:'classrooms'},
```

---

## ÉTAPE 3: Ajouter la page de navigation

### Ajouter cette route dans le système de navigation:

```javascript
// Dans le système de pages principal
case 'classrooms':
  return renderClassroomsPage();
  break;
```

---

## ÉTAPE 4: Créer les fonctions de rendu

### Ajouter après les autres fonctions de rendu:

```javascript
/**
 * 🎓 PAGE: SALLES DE CLASSE
 */
function renderClassroomsPage() {
  let html = `
    <div class="page-header">
      <h1>🎓 Salles de Classe</h1>
      <p>Découvrez tous les cours de votre classe</p>
    </div>
    
    <div class="tabs-container">
      <div class="tabs">
        <button class="tab-btn active" data-tab="mes-courses" onclick="switchClassroomTab(event, 'mes-courses')">
          📚 Mes Cours
        </button>
        <button class="tab-btn" data-tab="toutes-classes" onclick="switchClassroomTab(event, 'toutes-classes')">
          🎯 Toutes les Classes
        </button>
      </div>
      
      <div id="mes-courses" class="tab-content active">
        <div class="classrooms-section">
          <!-- Afficher les cours de la classe actuelle de l'élève -->
          <div id="my-classroom-courses"></div>
        </div>
      </div>
      
      <div id="toutes-classes" class="tab-content">
        <div class="classrooms-section">
          <!-- Afficher toutes les salles -->
          <div id="all-classrooms"></div>
        </div>
      </div>
    </div>
  `;
  
  // Attendre que le DOM soit mis à jour
  setTimeout(() => {
    loadClassroomsData();
  }, 100);
  
  return html;
}

function loadClassroomsData() {
  // Charger les programmes personnalisés
  CourseManagementSystem.loadCustomProgrammes().then(() => {
    // Afficher ma classe
    const userClass = State.profile.classe || 'CP'; // À adapter selon vos données
    const myClassHTML = CourseManagementSystem.generateClassroomUI(userClass);
    const myClassroomContainer = document.getElementById('my-classroom-courses');
    if (myClassroomContainer) {
      myClassroomContainer.innerHTML = myClassHTML;
    }
    
    // Afficher toutes les classes
    let allClassesHTML = '';
    Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
      allClassesHTML += CourseManagementSystem.generateClassroomUI(className);
    });
    
    const allClassroomsContainer = document.getElementById('all-classrooms');
    if (allClassroomsContainer) {
      allClassroomsContainer.innerHTML = allClassesHTML;
    }
  });
}

function switchClassroomTab(event, tabName) {
  event.preventDefault();
  
  // Masquer tous les tabs
  document.querySelectorAll('.classrooms-section').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Désactiver tous les boutons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Afficher le tab sélectionné
  document.getElementById(tabName).parentElement.classList.add('active');
  event.target.classList.add('active');
  document.getElementById(tabName).style.display = 'block';
}
```

---

## ÉTAPE 5: Ajouter la page d'administration des cours

### Pour les écoles/profs - Ajouter une nouvelle page:

```javascript
/**
 * 🎓 ADMIN: GESTION DES PROGRAMMES
 */
function renderCoursesAdminPage() {
  let html = `
    <div class="page-header">
      <h1>📚 Gestion des Programmes</h1>
      <p>Personnalisez les cours de chaque classe</p>
    </div>
    
    <div class="info-box">
      <h3>ℹ️ Information</h3>
      <p>Cliquez sur une classe pour gérer ses cours. Vous pouvez ajouter, modifier ou supprimer des cours.</p>
    </div>
    
    <div id="admin-courses-container"></div>
  `;
  
  setTimeout(() => {
    CourseManagementSystem.loadCustomProgrammes().then(() => {
      const adminHTML = CourseManagementSystem.generateAdminPanel();
      const container = document.getElementById('admin-courses-container');
      if (container) {
        container.innerHTML = adminHTML;
      }
    });
  }, 100);
  
  return html;
}
```

### Ajouter à la navigation (pour écoles/profs):

```javascript
// Dans getSidebarLinks() pour role === 'school' ou 'teacher'
{ id:'pedagogy', icon:'📚', label:'Pédagogie', items:[
  {icon:'📁',label:'Gestion Cours',page:'courses-admin'},
  // ... autres items
]}
```

### Route pour la page admin:

```javascript
case 'courses-admin':
  return renderCoursesAdminPage();
  break;
```

---

## ÉTAPE 6: Ajouter les styles spécifiques

### Ajouter dans le `<style>` de Neoclass3.html:

```css
/* Styles supplémentaires pour les salles */
.classrooms-section {
  display: block;
  animation: fadeIn 0.5s ease;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.info-box {
  background: rgba(108, 99, 255, 0.1);
  border-left: 4px solid var(--primary);
  padding: 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
}

.info-box h3 {
  margin: 0 0 8px 0;
  color: var(--primary);
}

.info-box p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## ÉTAPE 7: Initialiser au démarrage

### Ajouter après l'initialisation de l'app:

```javascript
// Après que le profil de l'utilisateur est chargé
if (State.user && State.profile) {
  // Charger les programmes personnalisés
  CourseManagementSystem.loadCustomProgrammes().catch(err => {
    console.error('Erreur chargement programmes:', err);
  });
}
```

---

## ÉTAPE 8: Tester l'intégration

### Commandes de test dans la console:

```javascript
// Afficher tous les programmes
console.log(CourseManagementSystem.programmes);

// Afficher les cours d'une classe
console.log(CourseManagementSystem.getCoursesForClass('CP'));

// Afficher les détails d'un cours
console.log(CourseManagementSystem.getCourseDetails('CP', 'fr-cp'));

// Naviguer vers les salles
navigate('classrooms');

// Naviguer vers l'admin (pour admin/school)
navigate('courses-admin');
```

---

## 📊 STRUCTURE DE DONNÉES

### Exemple de structure sauvegardée dans Firestore:

```json
{
  "schools": {
    "school-id": {
      "programmes": {
        "CP": {
          "className": "CP",
          "courses": [
            {
              "id": "fr-cp",
              "name": "Français",
              "icon": "📖",
              "couleur": "#FF6B6B",
              "description": "Lecture, écriture et grammaire"
            }
          ],
          "updatedAt": "2026-06-17T10:30:00Z",
          "updatedBy": "user-id"
        }
      }
    }
  }
}
```

---

## 🔐 RÈGLES FIRESTORE

### À ajouter dans firestore.rules:

```firestore
match /schools/{schoolId}/programmes/{programmeId} {
  // Lire: tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Écrire: propriétaire de l'école ou admin
  allow write: if request.auth.uid == resource.data.updatedBy ||
                  get(/databases/$(database)/documents/schools/$(schoolId)).data.adminIds.contains(request.auth.uid);
}
```

---

## 🎯 FONCTIONNALITÉS AVANCÉES

### 1. Filtrer par niveau

```javascript
function displayByLevel(nivel) {
  const container = document.getElementById('all-classrooms');
  let html = '';
  
  Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
    if (prog.niveau === nivel) {
      html += CourseManagementSystem.generateClassroomUI(className);
    }
  });
  
  container.innerHTML = html;
}

// Utilisation
displayByLevel('primary');   // Primaire
displayByLevel('middle');    // Collège
displayByLevel('highschool'); // Lycée
```

### 2. Rechercher un cours

```javascript
function searchCourse(query) {
  const results = [];
  
  Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
    prog.courses.forEach(course => {
      if (course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase())) {
        results.push({ className, course });
      }
    });
  });
  
  return results;
}

// Utilisation
const results = searchCourse('mathématiques');
```

### 3. Exporter les programmes en PDF

```javascript
async function exportProgramsToPDF() {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 10;
  
  Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 10;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`${prog.icon} ${prog.name}`, 10, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    prog.courses.forEach(course => {
      doc.text(`• ${course.icon} ${course.name}`, 15, yPosition);
      yPosition += 6;
    });
    
    yPosition += 4;
  });
  
  doc.save('programmes-neoclass.pdf');
}
```

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Fichiers course-management-system.js et classroom-styles.css ajoutés
- [ ] Links et scripts ajoutés au HTML
- [ ] Navigation mise à jour
- [ ] Page de salles créée et testée
- [ ] Page d'admin créée (pour écoles/profs)
- [ ] Firestore rules mises à jour
- [ ] Tests sur mobile/tablet/desktop
- [ ] Permissions correctement vérifiées
- [ ] Messages de toast affichés correctement
- [ ] Données personnalisées sauvegardées dans Firestore

---

## 🐛 PROBLÈMES COURANTS

### Les cours ne s'affichent pas
```javascript
// Solution: Vérifier que CourseManagementSystem est chargé
if (typeof CourseManagementSystem === 'undefined') {
  console.error('CourseManagementSystem non disponible');
}
```

### Erreur "Cannot read property 'programmes'"
```javascript
// Solution: Attendre que le système soit initialisé
CourseManagementSystem.loadCustomProgrammes()
  .then(() => displayClassrooms())
  .catch(err => console.error('Erreur:', err));
```

### Styles ne s'appliquent pas
```javascript
// Solution: Vérifier que classroom-styles.css est chargé
const styleElement = document.querySelector('link[href*="classroom-styles"]');
if (!styleElement) {
  console.error('CSS non chargé');
}
```

---

## 📞 SUPPORT TECHNIQUE

Pour toute question:
1. Vérifier [GUIDE_SALLES_CLASSES.md](./GUIDE_SALLES_CLASSES.md)
2. Tester dans [classrooms-demo.html](./classrooms-demo.html)
3. Consulter le code source [course-management-system.js](./course-management-system.js)

---

**Créé pour Neoclass 🎓**
Guide d'Intégration - v1.0
