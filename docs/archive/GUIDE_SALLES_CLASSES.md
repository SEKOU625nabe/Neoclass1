# 🎓 GUIDE D'INTÉGRATION - SYSTÈME DE GESTION DES COURS PAR CLASSE

## 📋 Sommaire
1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Intégration dans Neoclass3.html](#intégration)
4. [Utilisation](#utilisation)
5. [Personnalisation](#personnalisation)
6. [API Référence](#api-référence)

---

## 🎯 Vue d'ensemble

Le **Système de Gestion des Cours par Classe** résout le problème identifié:
- ✅ Chaque classe a ses propres cours
- ✅ Chaque cours a une icone personnalisée (pas la même pour tous)
- ✅ Interface d'administration pour personnaliser
- ✅ Affichage beaux des salles de classe
- ✅ Support complet des systèmes guinéen et français

### 📊 Structure des Classes Supportées

**Primaire:**
- CP, CE1, CE2, CM1, CM2

**Collège:**
- 6ème, 5ème, 4ème, 3ème

**Lycée:**
- 2nde (SM, SE, SS)
- 1ère (SM, SE, SS)
- Terminale (SM, SE, SS)

---

## 💾 Installation

### Étape 1: Ajouter les fichiers JavaScript et CSS

```html
<!-- Dans le <head> de Neoclass3.html -->
<link rel="stylesheet" href="./classroom-styles.css">
<script src="./course-management-system.js" defer></script>
```

### Étape 2: Ajouter un conteneur pour les salles

```html
<!-- Dans le corps de Neoclass3.html -->
<div id="classrooms-container"></div>
```

### Étape 3: Initialiser le système

```javascript
// Dans le script principal de Neoclass3.html
CourseManagementSystem.loadCustomProgrammes().then(() => {
  displayClassrooms();
});
```

---

## 🔧 Intégration

### Option 1: Intégration Simple (Affichage basique)

```javascript
// Afficher les salles de classe
function showClassrooms() {
  const container = document.getElementById('classrooms-container');
  
  // Afficher une classe spécifique
  const classroomHTML = CourseManagementSystem.generateClassroomUI('CP');
  container.innerHTML = classroomHTML;
}

// Appeler la fonction
showClassrooms();
```

### Option 2: Intégration avec Navigation

```javascript
// Ajouter une page "salles" au routeur
const pages = {
  'classrooms': {
    render: () => {
      let html = '<div id="classrooms-container"></div>';
      setTimeout(() => {
        for (const className of Object.keys(CourseManagementSystem.programmes)) {
          const classHTML = CourseManagementSystem.generateClassroomUI(className);
          document.getElementById('classrooms-container').innerHTML += classHTML;
        }
      }, 100);
      return html;
    }
  }
};

// Naviguer vers les salles
navigate('classrooms');
```

### Option 3: Intégration Admin Complète

```javascript
// Ajouter au sidebar
const adminLinks = [
  {
    icon: '📚',
    label: 'Gestion Cours',
    page: 'courses-admin',
    render: () => {
      return `
        <div class="admin-courses-panel">
          ${CourseManagementSystem.generateAdminPanel()}
        </div>
      `;
    }
  }
];
```

---

## 📖 Utilisation

### Afficher les cours d'une classe

```javascript
// Obtenir tous les cours d'une classe
const courses = CourseManagementSystem.getCoursesForClass('CP');
console.log(courses);
// Résultat: Array de 5 objets cours
```

### Afficher les détails d'un cours

```javascript
// Obtenir les détails d'un cours
const course = CourseManagementSystem.getCourseDetails('CP', 'fr-cp');
console.log(course);
/*
{
  id: 'fr-cp',
  name: 'Français',
  icon: '📖',
  couleur: '#FF6B6B',
  description: 'Lecture, écriture et grammaire'
}
*/
```

### Afficher toutes les classes primaires

```javascript
// Afficher les classes d'un niveau
const classes = Object.entries(CourseManagementSystem.programmes)
  .filter(([_, prog]) => prog.niveau === 'primary')
  .map(([className, prog]) => `
    <div class="classroom-item" onclick="navigate('class-view', '${className}')">
      ${prog.icon} ${prog.name}
    </div>
  `);
```

---

## 🎨 Personnalisation

### Ajouter un cours

```javascript
// Ajouter un nouveau cours à une classe
const newCourse = {
  name: 'Informatique',
  icon: '💻',
  description: 'Introduction à l\'informatique',
  couleur: '#00B894'
};

await CourseManagementSystem.addCourse('CP', newCourse);
```

### Mettre à jour un cours

```javascript
// Modifier un cours existant
await CourseManagementSystem.updateCourse('CP', 'fr-cp', {
  name: 'Français Avancé',
  icon: '📚',
  couleur: '#FF8C42'
});
```

### Supprimer un cours

```javascript
// Supprimer un cours
await CourseManagementSystem.removeCourse('CP', 'fr-cp');
```

### Sauvegarder les modifications

```javascript
// Sauvegarder une classe personnalisée
const customCourses = [
  { id: 'fr', name: 'Français', icon: '📖', couleur: '#FF6B6B', description: '...' },
  { id: 'math', name: 'Maths', icon: '🔢', couleur: '#4ECDC4', description: '...' }
];

await CourseManagementSystem.saveProgrammeCustomization('CP', customCourses);
```

---

## 📚 API Référence

### CourseManagementSystem.programmes

Objet contenant tous les programmes par classe.

```javascript
CourseManagementSystem.programmes['CP']
// {
//   name: 'Cours Préparatoire',
//   niveau: 'primary',
//   couleur: '#FF6B6B',
//   icon: '🅰️',
//   courses: [...]
// }
```

### CourseManagementSystem.getCoursesForClass(className)

Retourne les cours d'une classe.

```javascript
CourseManagementSystem.getCoursesForClass('CE1')
// [
//   { id: 'fr-ce1', name: 'Français', ... },
//   { id: 'math-ce1', name: 'Calcul', ... },
//   ...
// ]
```

### CourseManagementSystem.getCourseDetails(className, courseId)

Retourne les détails d'un cours.

```javascript
CourseManagementSystem.getCourseDetails('CM1', 'math-cm1')
// {
//   id: 'math-cm1',
//   name: 'Mathématiques',
//   icon: '📐',
//   couleur: '#4ECDC4',
//   description: 'Géométrie et calcul'
// }
```

### CourseManagementSystem.addCourse(className, courseData)

Ajoute un nouveau cours.

```javascript
await CourseManagementSystem.addCourse('6eme', {
  name: 'Technologie',
  icon: '⚙️',
  description: 'Initiation à la technologie',
  couleur: '#FF7675'
})
// Returns: boolean
```

### CourseManagementSystem.updateCourse(className, courseId, updates)

Met à jour un cours existant.

```javascript
await CourseManagementSystem.updateCourse('3eme', 'math-3', {
  name: 'Mathématiques Avancée',
  couleur: '#0984E3'
})
// Returns: boolean
```

### CourseManagementSystem.removeCourse(className, courseId)

Supprime un cours.

```javascript
await CourseManagementSystem.removeCourse('CE2', 'sci-ce2')
// Returns: boolean
```

### CourseManagementSystem.generateClassroomUI(className)

Génère l'interface HTML d'une classe.

```javascript
const html = CourseManagementSystem.generateClassroomUI('CM1');
document.getElementById('container').innerHTML = html;
```

### CourseManagementSystem.generateAdminPanel()

Génère le panneau d'administration.

```javascript
const adminHTML = CourseManagementSystem.generateAdminPanel();
document.getElementById('admin-container').innerHTML = adminHTML;
```

### CourseManagementSystem.saveProgrammeCustomization(className, courses)

Sauvegarde les modifications dans Firestore.

```javascript
await CourseManagementSystem.saveProgrammeCustomization('CP', customCourses)
// Returns: boolean
```

### CourseManagementSystem.loadCustomProgrammes()

Charge les programmes personnalisés depuis Firestore.

```javascript
await CourseManagementSystem.loadCustomProgrammes()
```

---

## 🎓 Exemples Complets

### Exemple 1: Afficher les salles par niveau

```javascript
function displayClassroomsByLevel(niveau) {
  const container = document.getElementById('classrooms-container');
  let html = '';
  
  Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
    if (prog.niveau === niveau) {
      html += CourseManagementSystem.generateClassroomUI(className);
    }
  });
  
  container.innerHTML = html;
}

// Utilisation
displayClassroomsByLevel('primary'); // Affiche CP, CE1, CE2, CM1, CM2
displayClassroomsByLevel('middle');  // Affiche 6ème, 5ème, 4ème, 3ème
displayClassroomsByLevel('highschool'); // Affiche toutes les classes de lycée
```

### Exemple 2: Créer une page de sélection de classe

```javascript
function showClassSelection() {
  const container = document.getElementById('class-selector');
  let html = '<div class="classrooms-grid">';
  
  Object.entries(CourseManagementSystem.programmes).forEach(([className, prog]) => {
    html += `
      <div class="classroom-quick-item" onclick="selectClass('${className}')">
        <span class="classroom-quick-icon">${prog.icon}</span>
        <div class="classroom-quick-info">
          <h4>${prog.name}</h4>
          <p>${prog.courses.length} cours</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function selectClass(className) {
  navigate('classroom-view', { className });
}
```

### Exemple 3: Afficher les cours d'une classe

```javascript
function displayCoursesForClass(className) {
  const courses = CourseManagementSystem.getCoursesForClass(className);
  const container = document.getElementById('courses-container');
  
  let html = courses.map(course => `
    <div class="course-card" style="border-left-color: ${course.couleur}">
      <div class="course-icon">${course.icon}</div>
      <h3>${course.name}</h3>
      <p>${course.description}</p>
      <button onclick="openCourse('${className}', '${course.id}')">
        Accéder →
      </button>
    </div>
  `).join('');
  
  container.innerHTML = html;
}
```

### Exemple 4: Interface d'administration complète

```javascript
function setupAdminPanel() {
  // Charger les programmes custom
  await CourseManagementSystem.loadCustomProgrammes();
  
  // Afficher le panneau
  const adminHTML = CourseManagementSystem.generateAdminPanel();
  document.getElementById('admin-container').innerHTML = adminHTML;
  
  // Ajouter les événements
  document.querySelectorAll('.admin-class-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const button = e.currentTarget.querySelector('.btn');
      if (button) button.click();
    });
  });
}
```

---

## 🔐 Sécurité et Permissions

### Vérifier les permissions admin

```javascript
function canEditCourses() {
  return State.user && 
         (State.profile.role === 'admin' || 
          State.profile.role === 'school' ||
          State.profile.role === 'teacher');
}

// Avant d'afficher le formulaire d'édition
if (canEditCourses()) {
  showEditButton = true;
}
```

### Sauvegarder avec authentification

```javascript
// Dans saveProgrammeCustomization
await db.collection('schools').doc(State.profile.schoolId)
  .collection('programmes').doc(className).set({
    className,
    courses: customCourses,
    updatedAt: new Date().toISOString(),
    updatedBy: State.user.uid,
    schoolId: State.profile.schoolId
  }, { merge: true });
```

---

## 📱 Responsive Design

Les styles sont 100% responsive grâce à CSS Grid et Flexbox.

```css
/* Mobile-first */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr; /* Une colonne */
  }
  
  .classroom-header {
    flex-direction: column; /* Empilé */
  }
}

/* Tablette */
@media (min-width: 768px) and (max-width: 1024px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .courses-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🎨 Thème Personnalisé

### Modifier les couleurs

```javascript
// Modifier la couleur d'une classe
CourseManagementSystem.programmes['CP'].couleur = '#FF6B6B';

// Modifier la couleur d'un cours
CourseManagementSystem.programmes['CP'].courses[0].couleur = '#4ECDC4';
```

### Créer un thème personnalisé

```javascript
// Créer une nouvelle classe avec programme personnalisé
CourseManagementSystem.programmes['MonClasse'] = {
  name: 'Ma Classe Personnalisée',
  niveau: 'primary',
  couleur: '#FF006E',
  icon: '🎓',
  courses: [
    { id: 'course1', name: 'Cours 1', icon: '📚', couleur: '#FF006E', description: 'Description' },
    { id: 'course2', name: 'Cours 2', icon: '🔢', couleur: '#4ECDC4', description: 'Description' }
  ]
};
```

---

## 🐛 Dépannage

### Les cours ne s'affichent pas

```javascript
// Vérifier si les programmes sont chargés
console.log(CourseManagementSystem.programmes);

// Recharger les données
CourseManagementSystem.loadCustomProgrammes();
```

### Les modifications ne sont pas sauvegardées

```javascript
// Vérifier l'utilisateur
console.log(State.user, State.profile);

// Vérifier les permissions Firebase
// Voir firestore.rules
```

### Les icones ne s'affichent pas

```javascript
// Vérifier que les emojis sont supportés
console.log(CourseManagementSystem.programmes['CP'].courses[0].icon);

// Forcer le rendu
displayClassrooms();
```

---

## 📞 Support

Pour toute question ou problème, consultez:
- [classrooms-demo.html](./classrooms-demo.html) - Demo interactive
- [course-management-system.js](./course-management-system.js) - Code source
- [classroom-styles.css](./classroom-styles.css) - Styles

---

## ✅ Checklist d'intégration

- [ ] Fichiers JavaScript/CSS ajoutés au projet
- [ ] Liens dans le HTML correctement configurés
- [ ] Conteneur `classrooms-container` présent
- [ ] CourseManagementSystem initialisé
- [ ] Firestore rules mises à jour (si applicable)
- [ ] Tests sur mobile/tablette/desktop
- [ ] Admin panel accessible aux enseignants/écoles
- [ ] Permissions vérifiées

---

**Créé pour Neoclass 🎓**
Système de Gestion des Cours par Classe - v1.0
