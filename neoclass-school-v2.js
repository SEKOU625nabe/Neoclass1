// ============================================================
// NEOCLASS – MODULE ÉCOLE AVANCÉ v2.0
// À insérer AVANT </body> dans le fichier HTML principal
// Remplace les anciennes fonctions du même nom
// ============================================================

// ============================================================
// FONCTION UTILITAIRE: Vérifier si utilisateur est une école
// ============================================================
function isSchool() {
  if (typeof State === 'undefined' || !State || !State.user || !State.profile) return false;
  return State.profile.role === 'school';
}

function getSchoolId() {
  return State && State.user ? State.user.uid : null;
}

// ============================================================
// 1. GESTION DES CLASSES (Créer, Voir, Élèves)
// ============================================================

// Enregistrer la page dans le routeur au chargement
(function patchRouter() {
  function tryPatchRouter() {
    if (typeof State === 'undefined' || typeof navigate !== 'function') {
      return setTimeout(tryPatchRouter, 100);
    }

    if (typeof pages !== 'undefined') {
      pages['school-classes'] = renderSchoolClasses;
      pages['school-student-profile'] = renderStudentProfile;
      pages['school-bulletin-config'] = renderBulletinConfig;
      pages['school-teachers'] = renderTeachersManagement;
      pages['school-directors'] = renderDirectorsManagement;
    }
    patchSchoolSidebar();
  }

  document.addEventListener('DOMContentLoaded', tryPatchRouter);
})();

function patchSchoolSidebar() {
  // Ajoute "Gestion Classes" dans le sidebar si pas déjà présent
  // (appelé dynamiquement — le sidebar se reconstruit à chaque navigation)
}

// ============================================================
// PAGE: Gestion des Classes
// ============================================================
async function renderSchoolClasses(app) {
  if (!State || !State.user) { 
    setTimeout(() => navigate('dashboard'), 100); 
    return; 
  }
  const sl = getSidebarLinks('school');

  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <div class="flex justify-between items-center mb-3" style="flex-wrap:wrap;gap:12px;">
        <h1 style="font-size:1.6rem;font-weight:800;">🏫 Gestion des Classes</h1>
        <button class="btn btn-primary" onclick="openCreateClassModal()">+ Créer une classe</button>
      </div>

      <!-- Barre de recherche classes -->
      <div class="card mb-3" style="padding:16px;">
        <input class="form-input" id="classSearchInput" placeholder="🔍 Rechercher une classe..." oninput="filterClasses(this.value)" style="max-width:400px;" />
      </div>

      <!-- Liste des classes -->
      <div id="classesList">
        <div class="text-center" style="padding:40px;color:var(--text-secondary);">
          <span style="font-size:3rem;">⏳</span><br/>Chargement des classes...
        </div>
      </div>
    </main>
  </div>`;

  await loadAndRenderClasses();
}

let _allClasses = [];

async function loadAndRenderClasses() {
  try {
    if (!State || !State.user) {
      console.error('État non disponible');
      return;
    }
    
    const schoolId = State.user.uid;
    console.log('📚 Chargement classes pour:', schoolId);
    
    const snap = await db.collection('classes')
      .where('schoolId', '==', schoolId)
      .get();
    
    _allClasses = [];
    snap.forEach(doc => {
      const classData = { id: doc.id, ...doc.data() };
      console.log('✅ Classe:', classData.name);
      _allClasses.push(classData);
    });
    
    console.log('📊 Total classes:', _allClasses.length);
    renderClassesGrid(_allClasses);
  } catch (e) {
    console.error('❌ Erreur:', e);
    const el = document.getElementById('classesList');
    if (el) el.innerHTML = `<div class="card" style="padding:20px;background:rgba(239,68,68,.08);border:2px solid #ef4444;">
      <p style="color:#ef4444;"><b>❌ Erreur:</b> ${e.message || e}</p>
    </div>`;
  }
}

function filterClasses(query) {
  const q = query.toLowerCase();
  const filtered = _allClasses.filter(c => (c.name || '').toLowerCase().includes(q) || (c.level || '').toLowerCase().includes(q));
  renderClassesGrid(filtered);
}

function renderClassesGrid(classes) {
  const el = document.getElementById('classesList');
  if (!el) return;
  if (classes.length === 0) {
    el.innerHTML = `<div class="card text-center" style="padding:40px;">
      <div style="font-size:3rem;">📭</div>
      <h3 class="mt-2">Aucune classe</h3>
      <p style="color:var(--text-secondary);">Créez votre première classe pour commencer.</p>
      <button class="btn btn-primary mt-3" onclick="openCreateClassModal()">+ Créer une classe</button>
    </div>`;
    return;
  }

  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
  classes.forEach(c => {
    const studentCount = c.studentCount || 0;
    html += `
    <div class="card" style="cursor:pointer;border:2px solid var(--border);transition:all .2s;padding:20px;" 
         onmouseenter="this.style.borderColor='var(--primary)';this.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'" 
         onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='none'"
         onclick="openClassDetail('${c.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:2rem;">🏫</span>
        <span class="badge badge-primary">${studentCount} élève${studentCount > 1 ? 's' : ''}</span>
      </div>
      <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:4px;">${c.name || c.level || 'Classe'}</h3>
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px;">${c.level || ''} ${c.description ? '· ' + c.description : ''}</p>
      ${c.mainTeacher ? `<p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px;">👨‍🏫 Prof: <b>${c.mainTeacher}</b></p>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openClassDetail('${c.id}')" style="flex:1;">👥 Élèves</button>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openEditClassModal('${c.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteClass('${c.id}')">🗑️</button>
      </div>
    </div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

function openCreateClassModal() {
  const sys = State.profile.system || 'guinea';
  const data = eduData[sys];
  const allLevels = [...(data.primary || []), ...(data.middle || []), ...((data.highschool && data.highschool.levels) || [])];

  const html = `
  <h3>🏫 Créer une nouvelle classe</h3>
  <div class="form-group mt-3">
    <label>Nom de la classe *</label>
    <input class="form-input" id="newClassName" placeholder="Ex: 6ème A, CM2 Soir..." required />
  </div>
  <div class="form-group">
    <label>Niveau scolaire *</label>
    <select class="form-input" id="newClassLevel">
      <option value="">-- Choisir le niveau --</option>
      ${allLevels.map(l => `<option value="${l}">${l}</option>`).join('')}
    </select>
  </div>
  <div class="form-group">
    <label>Description (optionnel)</label>
    <input class="form-input" id="newClassDesc" placeholder="Ex: Classe du matin, 35 élèves" />
  </div>
  <div class="form-group">
    <label>Professeur principal (optionnel)</label>
    <input class="form-input" id="newClassTeacher" placeholder="Nom du professeur principal" />
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="saveNewClass()">✅ Créer la classe</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

async function saveNewClass() {
  const name = document.getElementById('newClassName')?.value.trim();
  const level = document.getElementById('newClassLevel')?.value;
  const desc = document.getElementById('newClassDesc')?.value.trim();
  const teacher = document.getElementById('newClassTeacher')?.value.trim();

  if (!name || !level) { showToast('Nom et niveau requis', 'error'); return; }

  try {
    const docRef = await db.collection('classes').add({
      name,
      level,
      description: desc || '',
      mainTeacher: teacher || '',
      schoolId: State.user.uid,
      schoolName: State.profile.schoolName || State.profile.fullName || '',
      studentCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✅ Classe créée !', 'success');
    closeModal();
    await loadAndRenderClasses();
  } catch (e) {
    console.error(e);
    showToast('Erreur de création', 'error');
  }
}

async function openEditClassModal(classId) {
  const doc = await db.collection('classes').doc(classId).get();
  if (!doc.exists) { showToast('Classe introuvable', 'error'); return; }
  const c = doc.data();

  const html = `
  <h3>✏️ Modifier la classe</h3>
  <div class="form-group mt-3">
    <label>Nom de la classe *</label>
    <input class="form-input" id="editClassName" value="${c.name || ''}" required />
  </div>
  <div class="form-group">
    <label>Description</label>
    <input class="form-input" id="editClassDesc" value="${c.description || ''}" />
  </div>
  <div class="form-group">
    <label>Professeur principal</label>
    <input class="form-input" id="editClassTeacher" value="${c.mainTeacher || ''}" />
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="updateClass('${classId}')">💾 Sauvegarder</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

async function updateClass(classId) {
  const name = document.getElementById('editClassName')?.value.trim();
  if (!name) { showToast('Nom requis', 'error'); return; }
  try {
    await db.collection('classes').doc(classId).update({
      name,
      description: document.getElementById('editClassDesc')?.value.trim() || '',
      mainTeacher: document.getElementById('editClassTeacher')?.value.trim() || ''
    });
    showToast('✅ Classe modifiée !', 'success');
    closeModal();
    await loadAndRenderClasses();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

async function deleteClass(classId) {
  if (!confirm('Supprimer cette classe ? Les élèves ne seront pas supprimés.')) return;
  try {
    await db.collection('classes').doc(classId).delete();
    showToast('Classe supprimée', 'success');
    await loadAndRenderClasses();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

// ============================================================
// PAGE: Détail d'une Classe (liste des élèves avec recherche)
// ============================================================
async function openClassDetail(classId) {
  const classDoc = await db.collection('classes').doc(classId).get();
  if (!classDoc.exists) { showToast('Classe introuvable', 'error'); return; }
  const classData = { id: classDoc.id, ...classDoc.data() };

  const app = document.getElementById('app');
  const sl = getSidebarLinks('school');

  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="navigate('school-classes')">← Retour</button>
        <h1 style="font-size:1.6rem;font-weight:800;">🏫 ${classData.name || classData.level}</h1>
        <span class="badge badge-primary">${classData.level || ''}</span>
        ${classData.mainTeacher ? `<span class="badge badge-accent">👨‍🏫 Prof: ${classData.mainTeacher}</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;background:linear-gradient(135deg,rgba(108,99,255,.1),rgba(108,99,255,.05));">
          <div style="font-size:.85rem;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px;">Total</div>
          <div style="font-size:2rem;font-weight:800;color:var(--primary);" id="classStudentCount">0</div>
        </div>
        <div class="card" style="padding:16px;background:linear-gradient(135deg,rgba(14,184,122,.1),rgba(14,184,122,.05));">
          <div style="font-size:.85rem;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px;">Filles</div>
          <div style="font-size:2rem;font-weight:800;color:#0eb87a;" id="classGirlsCount">0</div>
        </div>
        <div class="card" style="padding:16px;background:linear-gradient(135deg,rgba(59,128,246,.1),rgba(59,128,246,.05));">
          <div style="font-size:.85rem;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px;">Garçons</div>
          <div style="font-size:2rem;font-weight:800;color:#3b80f6;" id="classBoysCount">0</div>
        </div>
      </div>

      <div class="card mb-3" style="padding:16px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <input class="form-input" id="studentSearchInput" placeholder="🔍 Rechercher un élève..." oninput="filterStudentsInClass(this.value)" style="flex:1;min-width:200px;" />
          <button class="btn btn-primary" onclick="openAddStudentToClassModal('${classId}')">+ Ajouter élève</button>
        </div>
      </div>

      <div id="classStudentsList">
        <p style="color:var(--text-secondary);text-align:center;padding:30px;">Chargement...</p>
      </div>
    </main>
  </div>`;

  window._currentClassId = classId;
  window._currentClassData = classData;
  await loadStudentsOfClass(classId);
}

let _classStudents = [];

async function loadStudentsOfClass(classId) {
  try {
    // Chercher élèves par classId
    const snap1 = await db.collection('users').where('classId', '==', classId).where('role', '==', 'student').get();
    const studentsMap = {};
    snap1.forEach(doc => { studentsMap[doc.id] = { id: doc.id, ...doc.data() }; });

    _classStudents = Object.values(studentsMap);

    // Compter filles et garçons
    let girlsCount = 0, boysCount = 0;
    _classStudents.forEach(s => {
      const gender = s.gender || '';
      if (gender.toLowerCase().includes('f') || gender === 'Fille') girlsCount++;
      else if (gender.toLowerCase().includes('g') || gender === 'Garçon') boysCount++;
    });

    // Mettre à jour le count
    await db.collection('classes').doc(classId).update({ studentCount: _classStudents.length });

    // Mettre à jour les compteurs
    const totalEl = document.getElementById('classStudentCount');
    const girlsEl = document.getElementById('classGirlsCount');
    const boysEl = document.getElementById('classBoysCount');
    if (totalEl) totalEl.textContent = _classStudents.length;
    if (girlsEl) girlsEl.textContent = girlsCount;
    if (boysEl) boysEl.textContent = boysCount;

    renderStudentsTable(_classStudents);
  } catch (e) {
    console.error(e);
    const el = document.getElementById('classStudentsList');
    if (el) el.innerHTML = '<p style="color:var(--danger);">Erreur de chargement des élèves.</p>';
  }
}

function filterStudentsInClass(query) {
  const q = query.toLowerCase();
  const filtered = _classStudents.filter(s =>
    (s.fullName || '').toLowerCase().includes(q) ||
    (s.firstName || '').toLowerCase().includes(q) ||
    (s.lastName || '').toLowerCase().includes(q) ||
    (s.studentId || '').toLowerCase().includes(q)
  );
  renderStudentsTable(filtered);
}

function renderStudentsTable(students) {
  const el = document.getElementById('classStudentsList');
  if (!el) return;

  if (students.length === 0) {
    el.innerHTML = `<div class="card text-center" style="padding:30px;">
      <div style="font-size:3rem;">📭</div>
      <h3>Aucun élève</h3>
      <p style="color:var(--text-secondary);">Aucun élève dans cette classe pour le moment.</p>
    </div>`;
    return;
  }

  let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:var(--bg-2);border-bottom:2px solid var(--border);">';
  html += '<th style="padding:12px;text-align:left;">Photo</th>';
  html += '<th style="padding:12px;text-align:left;">Nom</th>';
  html += '<th style="padding:12px;text-align:center;">ID</th>';
  html += '<th style="padding:12px;text-align:left;">Genre</th>';
  html += '<th style="padding:12px;text-align:left;">Parent</th>';
  html += '<th style="padding:12px;text-align:left;">Téléphone Parent</th>';
  html += '<th style="padding:12px;text-align:left;">Statut</th>';
  html += '<th style="padding:12px;text-align:center;">Actions</th>';
  html += '</tr></thead><tbody>';

  students.forEach((s, idx) => {
    const photoHtml = s.photoURL
      ? `<img src="${s.photoURL}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />`
      : `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:1.2rem;">👤</div>`;

    const statusBadge = s.isBanned
      ? `<span class="badge" style="background:#ef4444;color:#fff;">🚫 Renvoyé</span>`
      : `<span class="badge badge-success">✅ Actif</span>`;

    const rowBg = idx % 2 === 0 ? 'transparent' : 'var(--bg-2)';

    html += `<tr style="border-bottom:1px solid var(--border);background:${rowBg};">
      <td style="padding:12px;">${photoHtml}</td>
      <td style="padding:12px;"><b>${s.fullName || (s.firstName + ' ' + s.lastName) || 'N/A'}</b></td>
      <td style="padding:12px;text-align:center;"><code style="font-size:.8rem;background:var(--bg);padding:2px 6px;border-radius:4px;">${s.studentId || s.uid?.substring(0, 8) || '-'}</code></td>
      <td style="padding:12px;">${s.gender || '-'}</td>
      <td style="padding:12px;"><b>${s.parentName || '-'}</b></td>
      <td style="padding:12px;"><a href="tel:${s.parentPhone}" style="color:var(--primary);text-decoration:none;">${s.parentPhone || '-'}</a></td>
      <td style="padding:12px;">${statusBadge}</td>
      <td style="padding:12px;text-align:center;">
        <button class="btn btn-primary btn-sm" onclick="openStudentProfile('${s.id}')" style="padding:4px 8px;font-size:.8rem;">👁️ Voir</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

async function openAddStudentToClassModal(classId) {
  const html = `<h3>➕ Ajouter un élève à cette classe</h3>
  <p style="color:var(--text-secondary);margin-bottom:16px;">L'élève doit d'abord être inscrit.</p>
  <div class="form-group">
    <label>Chercher un élève inscrit</label>
    <input class="form-input" id="addStudentSearch" placeholder="Rechercher par nom ou ID..." />
    <div id="addStudentResults" style="margin-top:12px;max-height:300px;overflow-y:auto;"></div>
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  
  openModal(html);

  document.getElementById('addStudentSearch')?.addEventListener('input', async function() {
    const query = this.value.toLowerCase();
    const snap = await db.collection('users').where('schoolId', '==', State.user.uid).where('role', '==', 'student').get();
    let results = ``;
    snap.forEach(doc => {
      const s = doc.data();
      if ((s.fullName || '').toLowerCase().includes(query) || (s.studentId || '').toLowerCase().includes(query)) {
        results += `<div class="card card-flat" style="padding:8px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
          onclick="assignStudentToClass('${doc.id}', '${classId}')">
          <div><b>${s.fullName}</b><br/><span style="font-size:.8rem;color:var(--text-secondary);">${s.studentId || ''}</span></div>
          <span>➕</span>
        </div>`;
      }
    });
    document.getElementById('addStudentResults').innerHTML = results || '<p style="color:var(--text-secondary);">Aucun élève trouvé.</p>';
  });
}

async function assignStudentToClass(studentId, classId) {
  try {
    await db.collection('users').doc(studentId).update({ classId });
    showToast('✅ Élève ajouté à la classe!', 'success');
    closeModal();
    await loadStudentsOfClass(classId);
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

async function toggleBanStudent(studentId, ban) {
  const action = ban ? 'renvoyer' : 'réintégrer';
  const reason = ban ? prompt(`Raison du renvoi de cet élève ?`) : null;
  if (ban && reason === null) return; // Annulé

  try {
    const updateData = {
      isBanned: ban,
      bannedAt: ban ? firebase.firestore.FieldValue.serverTimestamp() : null,
      banReason: reason || '',
      banUpdatedBy: State.user.uid
    };
    await db.collection('users').doc(studentId).update(updateData);
    showToast(ban ? '🚫 Élève renvoyé' : '✅ Élève réintégré', ban ? 'warning' : 'success');
    await loadStudentsOfClass(window._currentClassId);
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

// ============================================================
// PAGE: Profil complet d'un élève
// ============================================================
async function openStudentProfile(studentId) {
  const app = document.getElementById('app');
  const sl = getSidebarLinks('school');

  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <button class="btn btn-ghost btn-sm mb-3" onclick="history.back()">← Retour</button>
      <div id="studentProfileContent">
        <p style="text-align:center;padding:40px;color:var(--text-secondary);">⏳ Chargement du profil...</p>
      </div>
    </main>
  </div>`;

  try {
    const studentDoc = await db.collection('users').doc(studentId).get();
    if (!studentDoc.exists) { showToast('Élève introuvable', 'error'); return; }
    const s = { id: studentDoc.id, ...studentDoc.data() };

    // Charger les résultats
    const resultsSnap = await db.collection('studentResults').where('studentId', '==', studentId).get();
    const results = [];
    resultsSnap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

    // Charger les notes brutes
    const gradesSnap = await db.collection('grades').where('schoolId', '==', State.user.uid).get();
    const studentGrades = [];
    gradesSnap.forEach(doc => {
      const g = doc.data();
      (g.grades || []).forEach(gr => {
        if (gr.studentId === studentId) {
          studentGrades.push({ subject: g.subject, period: g.period, evalType: g.evalType, grade: gr.grade });
        }
      });
    });

    const photoHtml = s.photoURL
      ? `<img src="${s.photoURL}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid var(--primary);" />`
      : `<div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:3.5rem;border:4px solid var(--primary);">👤</div>`;

    const statusBadge = s.isBanned
      ? `<span class="badge" style="background:#ef4444;color:#fff;font-size:1rem;padding:8px 16px;">🚫 RENVOYÉ</span>`
      : `<span class="badge badge-success" style="font-size:1rem;padding:8px 16px;">✅ Actif</span>`;

    // Périodes disponibles
    const periods = [...new Set(results.map(r => r.period))];

    let resultsHtml = '';
    if (results.length === 0) {
      resultsHtml = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Aucun résultat publié pour cet élève.</p>';
    } else {
      results.sort((a, b) => (a.period || '').localeCompare(b.period));
      resultsHtml = results.map(r => {
        const periodLabel = r.period === 'T1' ? '1er Trimestre' : r.period === 'T2' ? '2ème Trimestre' : r.period === 'T3' ? '3ème Trimestre' : r.period || '';
        const subjects = Object.entries(r.subjectAvgs || {});
        return `
        <div class="card mb-2">
          <div class="flex justify-between items-center mb-2">
            <h4>📅 ${periodLabel}</h4>
            <div class="flex gap-2 items-center">
              <span style="font-size:1.4rem;font-weight:800;color:${r.passed ? 'var(--success)' : 'var(--danger)'};">${r.generalAvg}/20</span>
              <span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">${r.passed ? '✅ Admis' : '❌ Ajourné'}</span>
            </div>
          </div>
          <p style="font-size:.85rem;color:var(--text-secondary);">Rang: ${r.rank || '-'}${r.rank === 1 ? 'er' : 'ème'} / ${r.totalStudents || '-'}</p>
          <div class="table-wrapper mt-2">
            <table style="font-size:.85rem;">
              <thead><tr><th>Matière</th><th>Moyenne</th></tr></thead>
              <tbody>
                ${subjects.map(([sub, avg]) => `<tr><td>${sub}</td><td><b style="color:${avg >= 10 ? 'var(--success)' : 'var(--danger)'}">${typeof avg === 'number' ? avg.toFixed(2) : avg}/20</b></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <button class="btn btn-outline btn-sm mt-2" onclick="generateBulletin('${studentId}', '${r.period}')">📄 Voir le bulletin</button>
        </div>`;
      }).join('');
    }

    // Notes brutes par période/matière
    let gradesHtml = '';
    if (studentGrades.length > 0) {
      const byPeriod = {};
      studentGrades.forEach(g => {
        if (!byPeriod[g.period]) byPeriod[g.period] = [];
        byPeriod[g.period].push(g);
      });
      gradesHtml = '<div class="card mb-3"><h3 class="mb-2">📝 Notes détaillées</h3>';
      Object.entries(byPeriod).forEach(([period, grades]) => {
        const pLabel = period === 'T1' ? '1er Trim.' : period === 'T2' ? '2ème Trim.' : '3ème Trim.';
        gradesHtml += `<div class="mb-2"><b>${pLabel}</b><div class="table-wrapper"><table style="font-size:.82rem;"><thead><tr><th>Matière</th><th>Type</th><th>Note</th></tr></thead><tbody>`;
        grades.forEach(g => { gradesHtml += `<tr><td>${g.subject}</td><td>${g.evalType}</td><td><b>${g.grade}/20</b></td></tr>`; });
        gradesHtml += '</tbody></table></div></div>';
      });
      gradesHtml += '</div>';
    }

    const content = document.getElementById('studentProfileContent');
    if (content) content.innerHTML = `
    <!-- En-tête profil -->
    <div class="card mb-3" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;padding:30px;">
      <div class="flex gap-3 items-center" style="flex-wrap:wrap;">
        ${photoHtml}
        <div style="flex:1;">
          <h2 style="color:#fff;margin-bottom:8px;">${s.fullName || (s.firstName + ' ' + s.lastName) || 'N/A'}</h2>
          <p style="opacity:.9;">📚 ${s.className || s.level || 'Classe non définie'}</p>
          <p style="opacity:.9;">🆔 ${s.studentId || s.id.substring(0, 8)}</p>
          <div class="mt-2">${statusBadge}</div>
        </div>
      </div>
    </div>

    ${s.isBanned ? `
    <div class="card mb-3" style="background:rgba(239,68,68,.08);border:2px solid #ef4444;">
      <h4 style="color:#ef4444;">🚫 Informations de renvoi</h4>
      <p><b>Date:</b> ${s.bannedAt?.toDate ? s.bannedAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}</p>
      <p><b>Raison:</b> ${s.banReason || 'Non précisée'}</p>
      <button class="btn btn-success mt-2" onclick="toggleBanStudent('${s.id}', false);navigate('school-classes')">♻️ Réintégrer cet élève</button>
    </div>` : ''}

    <!-- Infos parents -->
    <div class="card mb-3">
      <h3>👨‍👩‍👧 Informations des Parents</h3>
      <div class="form-row mt-2">
        <div>
          <p><b>Nom du parent:</b> ${s.parentName || 'Non renseigné'}</p>
          <p><b>Téléphone:</b> ${s.parentPhone || 'Non renseigné'}</p>
          <p><b>Email parent:</b> ${s.parentEmail || s.childEmail || 'Non renseigné'}</p>
        </div>
        <div>
          <p><b>Email élève:</b> ${s.email || 'N/A'}</p>
          <p><b>Inscription:</b> ${s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}</p>
          <p><b>Système:</b> ${s.system === 'guinea' ? '🇬🇳 Guinéen' : '🇫🇷 Français'}</p>
        </div>
      </div>
      <button class="btn btn-outline btn-sm mt-2" onclick="openEditStudentInfo('${s.id}')">✏️ Modifier les informations</button>
    </div>

    <!-- Notes & Bulletins -->
    <div class="card mb-3">
      <h3 class="mb-3">📊 Résultats & Bulletins</h3>
      ${resultsHtml}
    </div>

    ${gradesHtml}

    <!-- Actions -->
    <div class="card mb-3">
      <h3 class="mb-2">⚙️ Actions</h3>
      <div class="flex gap-2" style="flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="generateAllBulletinsForStudent('${s.id}')">📄 Tous les bulletins</button>
        <button class="btn btn-outline" onclick="openChangeStudentClass('${s.id}', '${s.className || s.level || ''}')">🔄 Changer de classe</button>
        ${s.isBanned
          ? `<button class="btn btn-success" onclick="toggleBanStudent('${s.id}', false)">♻️ Réintégrer</button>`
          : `<button class="btn btn-danger" onclick="toggleBanStudent('${s.id}', true)">🚫 Renvoyer</button>`
        }
      </div>
    </div>`;
  } catch (e) {
    console.error(e);
    const el = document.getElementById('studentProfileContent');
    if (el) el.innerHTML = '<p style="color:var(--danger);">Erreur lors du chargement du profil.</p>';
  }
}

function openEditStudentInfo(studentId) {
  const html = `
  <h3>✏️ Modifier les infos de l'élève</h3>
  <div class="form-group mt-3">
    <label>Nom du parent</label>
    <input class="form-input" id="editParentName" placeholder="Nom complet du parent" />
  </div>
  <div class="form-group">
    <label>Téléphone du parent</label>
    <input class="form-input" id="editParentPhone" placeholder="Ex: 628 00 00 00" />
  </div>
  <div class="form-group">
    <label>Email du parent</label>
    <input class="form-input" id="editParentEmail" type="email" placeholder="parent@email.com" />
  </div>
  <div class="form-group">
    <label>Photo de profil</label>
    <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
      <div id="editPhotoPreview" style="width:60px;height:60px;border-radius:50%;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.5rem;overflow:hidden;">👤</div>
      <label class="btn btn-outline btn-sm" style="cursor:pointer;">
        📷 Choisir une photo
        <input type="file" id="editStudentPhoto" accept="image/*" style="display:none;" onchange="previewEditStudentPhoto(this)" />
      </label>
    </div>
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="saveStudentInfo('${studentId}')">💾 Sauvegarder</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

let _editStudentPhotoBase64 = null;
function previewEditStudentPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _editStudentPhotoBase64 = e.target.result;
      const preview = document.getElementById('editPhotoPreview');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveStudentInfo(studentId) {
  try {
    const updateData = {
      parentName: document.getElementById('editParentName')?.value.trim() || '',
      parentPhone: document.getElementById('editParentPhone')?.value.trim() || '',
      parentEmail: document.getElementById('editParentEmail')?.value.trim() || ''
    };
    if (_editStudentPhotoBase64) updateData.photoURL = _editStudentPhotoBase64;
    await db.collection('users').doc(studentId).update(updateData);
    showToast('✅ Informations mises à jour !', 'success');
    closeModal();
    _editStudentPhotoBase64 = null;
    openStudentProfile(studentId);
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

async function openChangeStudentClass(studentId, currentClass) {
  const sys = State.profile.system || 'guinea';
  const data = eduData[sys];
  const allLevels = [...(data.primary || []), ...(data.middle || []), ...((data.highschool && data.highschool.levels) || [])];

  // Récupérer aussi les classes personnalisées
  let classOptions = allLevels.map(l => `<option value="${l}" ${l === currentClass ? 'selected' : ''}>${l}</option>`).join('');
  try {
    const snap = await db.collection('classes').where('schoolId', '==', State.user.uid).get();
    snap.forEach(doc => {
      const c = doc.data();
      classOptions += `<option value="${c.name}" ${c.name === currentClass ? 'selected' : ''}>${c.name} (${c.level})</option>`;
    });
  } catch (e) {}

  const html = `
  <h3>🔄 Changer de classe</h3>
  <p style="color:var(--text-secondary);">Classe actuelle: <b>${currentClass || 'Non définie'}</b></p>
  <div class="form-group mt-3">
    <label>Nouvelle classe</label>
    <select class="form-input" id="newStudentClass">${classOptions}</select>
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="changeStudentClass('${studentId}')">✅ Changer</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

async function changeStudentClass(studentId) {
  const newClass = document.getElementById('newStudentClass')?.value;
  if (!newClass) return;
  try {
    await db.collection('users').doc(studentId).update({ className: newClass, level: newClass });
    showToast('✅ Classe changée !', 'success');
    closeModal();
    openStudentProfile(studentId);
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

// ============================================================
// BULLETIN: Remplace generateBulletin avec une version améliorée
// ============================================================
async function generateBulletin(studentId, periodOverride) {
  // Chercher le période depuis le sélecteur ou l'override
  const periodEl = document.getElementById('bulletinPeriod');
  const period = periodOverride || (periodEl ? periodEl.value : 'T1');

  try {
    showToast('⏳ Génération du bulletin...', 'info');
    const resultDoc = await db.collection('studentResults').doc(`${studentId}_${period}`).get();
    if (!resultDoc.exists) {
      showToast('Aucun résultat publié pour cette période', 'error');
      return;
    }

    const result = resultDoc.data();
    const studentDoc = await db.collection('users').doc(studentId).get();
    const student = studentDoc.data();
    const school = State.profile;
    const config = school.gradesConfig || {};
    const subjects = config.subjects || [];
    const bulletinConfig = school.bulletinConfig || {};

    const periodLabel = period === 'T1' ? '1er Trimestre' : period === 'T2' ? '2ème Trimestre' : period === 'T3' ? '3ème Trimestre' : period;
    const currentYear = new Date().getFullYear();
    const schoolYear = `${currentYear - 1}-${currentYear}`;

    // Déterminer la mention
    const avg = result.generalAvg || 0;
    let mention = '';
    if (avg >= 18) mention = 'Félicitations';
    else if (avg >= 16) mention = 'Très Bien';
    else if (avg >= 14) mention = 'Bien';
    else if (avg >= 12) mention = 'Assez Bien';
    else if (avg >= 10) mention = 'Passable';
    else mention = 'Insuffisant';

    // Appréciation générale
    const appreciation = avg >= 14
      ? 'Excellent travail ! Continuez sur cette lancée.'
      : avg >= 10
        ? 'Résultats satisfaisants. Des efforts supplémentaires permettront de progresser.'
        : 'Des efforts importants sont nécessaires. Un soutien est recommandé.';

    // Couleur thème
    const themeColor = bulletinConfig.themeColor || '#6c63ff';
    const headerBg = bulletinConfig.headerBg || '#f8f9fa';

    const bulletinHtml = `
    <div id="bulletinPrint" style="background:#fff;max-width:800px;margin:0 auto;font-family:'Arial',sans-serif;color:#333;padding:0;">
      
      <!-- HEADER ÉCOLE -->
      <div style="background:${themeColor};padding:0;border-radius:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 30px;background:${themeColor};">
          <!-- Logo -->
          <div style="display:flex;align-items:center;gap:15px;">
            ${school.schoolLogo
              ? `<img src="${school.schoolLogo}" style="width:80px;height:80px;border-radius:12px;object-fit:cover;border:3px solid rgba(255,255,255,.5);background:#fff;" />`
              : `<div style="width:80px;height:80px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:2.5rem;border:3px solid rgba(255,255,255,.3);">🏫</div>`
            }
            <div>
              <h2 style="margin:0;color:#fff;font-size:1.4rem;text-shadow:0 1px 3px rgba(0,0,0,.2);">${school.schoolName || school.fullName || 'École'}</h2>
              ${school.schoolAddress ? `<p style="margin:3px 0;color:rgba(255,255,255,.85);font-size:.85rem;">📍 ${school.schoolAddress}</p>` : ''}
              ${school.schoolPhone ? `<p style="margin:3px 0;color:rgba(255,255,255,.85);font-size:.85rem;">📞 ${school.schoolPhone}</p>` : ''}
            </div>
          </div>
          <!-- Titre -->
          <div style="text-align:right;">
            <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:15px 20px;border:1px solid rgba(255,255,255,.3);">
              <h3 style="margin:0;color:#fff;font-size:1.2rem;font-weight:800;text-transform:uppercase;letter-spacing:2px;">BULLETIN DE NOTES</h3>
              <p style="margin:5px 0 0;color:rgba(255,255,255,.9);font-size:1rem;font-weight:600;">${periodLabel}</p>
              <p style="margin:3px 0 0;color:rgba(255,255,255,.75);font-size:.85rem;">Année scolaire ${schoolYear}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- INFOS ÉLÈVE -->
      <div style="padding:20px 30px;background:#f8f9fa;border-bottom:2px solid ${themeColor};">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center;">
          <div style="display:flex;align-items:center;gap:15px;">
            ${student.photoURL
              ? `<img src="${student.photoURL}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid ${themeColor};" />`
              : `<div style="width:70px;height:70px;border-radius:50%;background:${themeColor};display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;">👤</div>`
            }
            <div>
              <p style="margin:3px 0;font-size:.85rem;color:#666;">Nom et Prénom</p>
              <p style="margin:3px 0;font-size:1.1rem;font-weight:800;color:#222;">${student.fullName || (student.firstName + ' ' + student.lastName) || 'N/A'}</p>
              <p style="margin:3px 0;font-size:.85rem;color:#666;">Classe: <b>${student.className || student.level || 'N/A'}</b> &nbsp;|&nbsp; ID: <code>${student.studentId || ''}</code></p>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="display:inline-block;background:#fff;border-radius:12px;padding:15px 25px;border:2px solid ${themeColor};box-shadow:0 2px 10px rgba(0,0,0,.08);">
              <p style="margin:0;font-size:.8rem;color:#666;text-transform:uppercase;letter-spacing:1px;">Moyenne Générale</p>
              <p style="margin:5px 0;font-size:2.5rem;font-weight:900;color:${avg >= 10 ? '#10b981' : '#ef4444'};">${avg.toFixed(2)}<span style="font-size:1rem;color:#666;">/20</span></p>
              <p style="margin:0;font-size:.9rem;font-weight:700;color:${themeColor};">Rang: ${result.rank || '-'}${result.rank === 1 ? 'er' : 'ème'} / ${result.totalStudents || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLEAU DES NOTES -->
      <div style="padding:20px 30px;">
        <h4 style="margin:0 0 12px;color:${themeColor};text-transform:uppercase;font-size:.9rem;letter-spacing:1px;">📚 Notes par matière</h4>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:${themeColor};color:#fff;">
              <th style="padding:12px 16px;text-align:left;border-radius:0;">Matière</th>
              <th style="padding:12px;text-align:center;">Coef.</th>
              <th style="padding:12px;text-align:center;">Moyenne /20</th>
              <th style="padding:12px;text-align:center;">Appréciation</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.length > 0
              ? subjects.map((s, i) => {
                  const avg_s = result.subjectAvgs?.[s.name];
                  const avgNum = typeof avg_s === 'number' ? avg_s : null;
                  const color = avgNum !== null ? (avgNum >= 10 ? '#10b981' : '#ef4444') : '#999';
                  const appre = avgNum === null ? '-' : avgNum >= 14 ? 'Très bien' : avgNum >= 12 ? 'Bien' : avgNum >= 10 ? 'Assez bien' : 'Insuffisant';
                  return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
                    <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee;">${s.name}</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;color:#666;">${s.coef}</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;font-weight:800;font-size:1.1rem;color:${color};">${avgNum !== null ? avgNum.toFixed(2) : 'N/R'}</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;font-size:.85rem;color:#666;font-style:italic;">${appre}</td>
                  </tr>`;
                }).join('')
              : Object.entries(result.subjectAvgs || {}).map(([sub, av], i) => {
                  const avgNum = typeof av === 'number' ? av : null;
                  const color = avgNum !== null ? (avgNum >= 10 ? '#10b981' : '#ef4444') : '#999';
                  return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
                    <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #eee;">${sub}</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;color:#666;">1</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;font-weight:800;font-size:1.1rem;color:${color};">${avgNum !== null ? avgNum.toFixed(2) : 'N/R'}</td>
                    <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;font-size:.85rem;color:#666;font-style:italic;">${avgNum >= 14 ? 'Très bien' : avgNum >= 10 ? 'Assez bien' : 'Insuffisant'}</td>
                  </tr>`;
                }).join('')
            }
          </tbody>
        </table>
      </div>

      <!-- RÉSULTAT & MENTION -->
      <div style="padding:0 30px 20px;">
        <div style="background:${avg >= 10 ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fee2e2,#fecaca)'};border-radius:12px;padding:20px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="margin:0;font-size:.85rem;color:#555;text-transform:uppercase;letter-spacing:1px;">Décision du conseil</p>
            <p style="margin:5px 0 0;font-size:1.6rem;font-weight:900;color:${avg >= 10 ? '#065f46' : '#991b1b'};">
              ${avg >= 10 ? '✅ ADMIS(E)' : '❌ AJOURNÉ(E)'}
            </p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-size:.85rem;color:#555;">Mention</p>
            <p style="margin:5px 0 0;font-size:1.2rem;font-weight:800;color:${avg >= 10 ? '#065f46' : '#991b1b'};">${mention}</p>
            <p style="margin:5px 0 0;font-size:.85rem;color:#666;font-style:italic;">${appreciation}</p>
          </div>
        </div>
      </div>

      <!-- SIGNATURES -->
      <div style="padding:20px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px;border-top:1px solid #eee;">
        <div style="text-align:center;">
          ${bulletinConfig.directorSignature
            ? `<img src="${bulletinConfig.directorSignature}" style="max-height:60px;max-width:120px;object-fit:contain;margin-bottom:8px;" />`
            : '<div style="height:60px;margin-bottom:8px;border-bottom:2px solid #333;"></div>'
          }
          <p style="margin:0;font-size:.85rem;font-weight:700;">Le Directeur/La Directrice</p>
          ${bulletinConfig.directorName ? `<p style="margin:3px 0;font-size:.8rem;color:#666;">${bulletinConfig.directorName}</p>` : ''}
        </div>
        <div style="text-align:center;">
          ${bulletinConfig.teacherSignature
            ? `<img src="${bulletinConfig.teacherSignature}" style="max-height:60px;max-width:120px;object-fit:contain;margin-bottom:8px;" />`
            : '<div style="height:60px;margin-bottom:8px;border-bottom:2px solid #333;"></div>'
          }
          <p style="margin:0;font-size:.85rem;font-weight:700;">Le Professeur Principal</p>
          <p style="margin:3px 0;font-size:.8rem;color:#666;">${window._currentClassData?.mainTeacher || ''}</p>
        </div>
        <div style="text-align:center;">
          <div style="height:60px;margin-bottom:8px;border-bottom:2px solid #333;"></div>
          <p style="margin:0;font-size:.85rem;font-weight:700;">Le Parent / Tuteur</p>
          <p style="margin:3px 0;font-size:.8rem;color:#666;">Signature et cachet</p>
        </div>
      </div>

      <!-- Cachet école -->
      <div style="padding:15px 30px;background:#f8f9fa;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
        <p style="margin:0;font-size:.75rem;color:#999;">Document officiel – ${school.schoolName || school.fullName}</p>
        ${bulletinConfig.schoolStamp
          ? `<img src="${bulletinConfig.schoolStamp}" style="max-height:70px;max-width:80px;object-fit:contain;opacity:.8;" />`
          : `<div style="width:80px;height:70px;border-radius:50%;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#ccc;text-align:center;">CACHET<br>ÉCOLE</div>`
        }
      </div>
    </div>

    <div class="flex gap-2 mt-3" style="justify-content:center;flex-wrap:wrap;">
      <button class="btn btn-success" onclick="checkBulletinBeforePrint()">✅ Vérifier puis Imprimer</button>
      <button class="btn btn-primary" onclick="printBulletin()">🖨️ Imprimer directement</button>
      <button class="btn btn-outline" onclick="sendBulletinToStudent('${studentId}', '${period}')">📨 Envoyer à l'élève</button>
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    </div>`;

    openModal(bulletinHtml, true);
  } catch (e) {
    console.error(e);
    showToast('Erreur de génération du bulletin', 'error');
  }
}

// Vérification avant impression
function checkBulletinBeforePrint() {
  const content = document.getElementById('bulletinPrint');
  if (!content) { showToast('Bulletin introuvable', 'error'); return; }

  const errors = [];
  const warnings = [];

  // Vérifier présence du nom école
  if (!State.profile.schoolName && !State.profile.fullName) errors.push('❌ Nom de l\'école manquant');

  // Vérifier les notes
  const notesCells = content.querySelectorAll('td');
  let hasNR = false;
  notesCells.forEach(td => { if (td.textContent === 'N/R') hasNR = true; });
  if (hasNR) warnings.push('⚠️ Certaines matières n\'ont pas de note (N/R)');

  // Vérifier le logo
  if (!State.profile.schoolLogo) warnings.push('⚠️ Pas de logo école (recommandé)');

  // Vérifier la signature
  const bulletinConfig = State.profile.bulletinConfig || {};
  if (!bulletinConfig.directorSignature) warnings.push('⚠️ Signature du directeur manquante');

  if (errors.length > 0) {
    const msg = `<h3>❌ Erreurs à corriger</h3>
    <div style="margin:15px 0;">${errors.map(e => `<p style="color:#ef4444;">${e}</p>`).join('')}</div>
    ${warnings.length > 0 ? `<h4>⚠️ Avertissements</h4>${warnings.map(w => `<p style="color:#f59e0b;">${w}</p>`).join('')}` : ''}
    <p style="margin-top:15px;color:var(--text-secondary);">Veuillez corriger les erreurs avant d'imprimer.</p>
    <button class="btn btn-ghost mt-2" onclick="closeModal()">OK</button>`;
    openModal(msg);
    return;
  }

  if (warnings.length > 0) {
    const msg = `<h3>⚠️ Avertissements</h3>
    ${warnings.map(w => `<p style="color:#f59e0b;">${w}</p>`).join('')}
    <p style="margin-top:15px;">Voulez-vous quand même imprimer ?</p>
    <div class="flex gap-2 mt-3">
      <button class="btn btn-primary" onclick="closeModal();printBulletin()">🖨️ Oui, imprimer</button>
      <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
    </div>`;
    openModal(msg);
    return;
  }

  // Pas d'erreurs ni d'avertissements
  showToast('✅ Bulletin vérifié — Impression en cours...', 'success');
  setTimeout(() => printBulletin(), 500);
}

// Envoyer le bulletin à l'élève (notification in-app)
async function sendBulletinToStudent(studentId, period) {
  try {
    const studentDoc = await db.collection('users').doc(studentId).get();
    if (!studentDoc.exists) { showToast('Élève introuvable', 'error'); return; }
    const student = studentDoc.data();
    const periodLabel = period === 'T1' ? '1er Trimestre' : period === 'T2' ? '2ème Trimestre' : '3ème Trimestre';

    await db.collection('messages').add({
      recipientId: studentId,
      senderId: State.user.uid,
      senderName: State.profile.schoolName || State.profile.fullName || 'École',
      schoolId: State.user.uid,
      type: 'school',
      title: `📄 Votre bulletin – ${periodLabel}`,
      body: `Bonjour ${student.fullName || ''}, votre bulletin du ${periodLabel} est disponible. Connectez-vous à Neoclass pour le consulter dans votre espace "Mes Résultats".`,
      period,
      bulletinAvailable: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    showToast('📨 Bulletin notifié à l\'élève !', 'success');
  } catch (e) {
    console.error(e);
    showToast('Erreur d\'envoi', 'error');
  }
}

// Envoyer à tous les élèves d'une classe
async function sendAllBulletinsToClass(classId, period) {
  try {
    const snap = await db.collection('users').where('classId', '==', classId).where('role', '==', 'student').get();
    let sent = 0;
    for (const doc of snap.docs) {
      await sendBulletinToStudent(doc.id, period);
      sent++;
    }
    showToast(`📨 Bulletins envoyés à ${sent} élèves !`, 'success');
  } catch (e) {
    showToast('Erreur d\'envoi groupé', 'error');
  }
}

async function generateAllBulletinsForStudent(studentId) {
  const periods = ['T1', 'T2', 'T3'];
  const periodLabel = { T1: '1er Trimestre', T2: '2ème Trimestre', T3: '3ème Trimestre' };
  let html = '<h3>📄 Bulletins disponibles</h3><div class="flex flex-col gap-2 mt-3">';
  for (const p of periods) {
    const doc = await db.collection('studentResults').doc(`${studentId}_${p}`).get();
    const avail = doc.exists;
    html += `<div class="card card-flat flex justify-between items-center" style="padding:12px;">
      <span>${periodLabel[p]}</span>
      ${avail
        ? `<button class="btn btn-primary btn-sm" onclick="closeModal();generateBulletin('${studentId}', '${p}')">📄 Voir</button>`
        : `<span style="color:var(--text-secondary);font-size:.85rem;">Non disponible</span>`
      }
    </div>`;
  }
  html += '</div><button class="btn btn-ghost mt-3 w-full" onclick="closeModal()">Fermer</button>';
  openModal(html);
}

// ============================================================
// PAGE: Configuration des Bulletins
// ============================================================
async function renderBulletinConfig(app) {
  if (!isSchool()) { navigate('dashboard'); return; }
  const sl = getSidebarLinks('school');
  const bulletinConfig = State.profile.bulletinConfig || {};

  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <h1 style="font-size:1.6rem;font-weight:800;" class="mb-3">🎨 Configuration des Bulletins</h1>
      <p style="color:var(--text-secondary);margin-bottom:20px;">Personnalisez le modèle de bulletin de votre école</p>

      <!-- Logo & Infos école -->
      <div class="card mb-3">
        <h3>🏫 Identité de l'école</h3>
        <div class="form-row mt-3">
          <div class="form-group">
            <label>Logo de l'école</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
              <div id="logoPreview" style="width:80px;height:80px;border-radius:12px;background:var(--bg);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden;">
                ${State.profile.schoolLogo ? `<img src="${State.profile.schoolLogo}" style="width:100%;height:100%;object-fit:cover;" />` : '🏫'}
              </div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                📷 Choisir un logo
                <input type="file" id="schoolLogoInput" accept="image/*" style="display:none;" onchange="previewSchoolLogo(this)" />
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Couleur principale du bulletin</label>
            <div class="flex gap-2 items-center mt-2">
              <input type="color" id="bulletinThemeColor" value="${bulletinConfig.themeColor || '#6c63ff'}" style="width:50px;height:40px;border:none;cursor:pointer;border-radius:8px;" />
              <span id="colorPreviewText" style="font-size:.9rem;">${bulletinConfig.themeColor || '#6c63ff'}</span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nom complet de l'école</label>
            <input class="form-input" id="bcSchoolName" value="${State.profile.schoolName || ''}" />
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input class="form-input" id="bcSchoolAddr" value="${State.profile.schoolAddress || ''}" />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input class="form-input" id="bcSchoolPhone" value="${State.profile.schoolPhone || ''}" />
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="card mb-3">
        <h3>✍️ Signatures</h3>
        <div class="form-row mt-3">
          <!-- Signature directeur -->
          <div class="form-group">
            <label>Nom du Directeur/Directrice</label>
            <input class="form-input" id="bcDirectorName" value="${bulletinConfig.directorName || ''}" placeholder="Mamadou Diallo" />
            <label style="margin-top:12px;display:block;">Signature numérique (image)</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
              <div id="dirSignPreview" style="width:120px;height:60px;border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:.8rem;color:var(--text-secondary);">
                ${bulletinConfig.directorSignature ? `<img src="${bulletinConfig.directorSignature}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : 'Signature'}
              </div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                📤 Upload
                <input type="file" id="dirSignInput" accept="image/*" style="display:none;" onchange="previewSignature(this, 'dirSignPreview', 'director')" />
              </label>
            </div>
          </div>

          <!-- Cachet -->
          <div class="form-group">
            <label>Cachet / Tampon de l'école</label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
              <div id="stampPreview" style="width:80px;height:80px;border:2px dashed var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:.7rem;color:var(--text-secondary);text-align:center;">
                ${bulletinConfig.schoolStamp ? `<img src="${bulletinConfig.schoolStamp}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : 'CACHET'}
              </div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                📤 Upload Cachet
                <input type="file" id="stampInput" accept="image/*" style="display:none;" onchange="previewSignature(this, 'stampPreview', 'stamp')" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Matières & Coefficients -->
      <div class="card mb-3">
        <div class="flex justify-between items-center mb-3">
          <h3>📚 Matières & Coefficients du bulletin</h3>
          <button class="btn btn-outline btn-sm" onclick="navigate('school-grades-config')">⚙️ Config Notes</button>
        </div>
        <p style="color:var(--text-secondary);font-size:.9rem;">Ces matières seront affichées dans les bulletins. Configurez-les dans "Config Notes".</p>
        <div class="mt-2" id="bulletinSubjectsPreview">
          ${(State.profile.gradesConfig?.subjects || []).map(s => `
            <div class="flex justify-between items-center mb-1" style="padding:8px 12px;background:var(--bg);border-radius:8px;">
              <span>${s.name}</span>
              <span class="badge badge-primary">Coef: ${s.coef}</span>
            </div>`).join('') || '<p style="color:var(--text-secondary);">Aucune matière configurée. Allez dans "Config Notes".</p>'}
        </div>
      </div>

      <!-- Aperçu -->
      <div class="card mb-3" style="background:linear-gradient(135deg,rgba(108,99,255,.05),rgba(245,158,11,.05));border:2px solid var(--primary);">
        <h3>👁️ Aperçu du modèle</h3>
        <p style="color:var(--text-secondary);">Cliquez sur un élève dans ses classes pour voir un bulletin complet.</p>
        <div id="bulletinColorBar" style="height:8px;border-radius:4px;background:${bulletinConfig.themeColor || '#6c63ff'};margin-top:12px;transition:all .3s;"></div>
      </div>

      <button class="btn btn-primary btn-block mb-3" onclick="saveBulletinConfig()">💾 Sauvegarder la configuration</button>
    </main>
  </div>`;

  // Mettre à jour la couleur en temps réel
  document.getElementById('bulletinThemeColor')?.addEventListener('input', function () {
    document.getElementById('colorPreviewText').textContent = this.value;
    const bar = document.getElementById('bulletinColorBar');
    if (bar) bar.style.background = this.value;
  });
}

let _bulletinConfigUploads = {};

function previewSchoolLogo(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _bulletinConfigUploads.schoolLogo = e.target.result;
      const preview = document.getElementById('logoPreview');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewSignature(input, previewId, type) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _bulletinConfigUploads[type] = e.target.result;
      const preview = document.getElementById(previewId);
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:100%;object-fit:contain;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveBulletinConfig() {
  try {
    const themeColor = document.getElementById('bulletinThemeColor')?.value || '#6c63ff';
    const directorName = document.getElementById('bcDirectorName')?.value.trim() || '';
    const schoolName = document.getElementById('bcSchoolName')?.value.trim() || '';
    const schoolAddress = document.getElementById('bcSchoolAddr')?.value.trim() || '';
    const schoolPhone = document.getElementById('bcSchoolPhone')?.value.trim() || '';

    const bulletinConfig = {
      themeColor,
      directorName,
      directorSignature: _bulletinConfigUploads.director || State.profile.bulletinConfig?.directorSignature || '',
      schoolStamp: _bulletinConfigUploads.stamp || State.profile.bulletinConfig?.schoolStamp || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(State.user.uid).update({
      bulletinConfig,
      schoolName: schoolName || State.profile.schoolName || '',
      schoolAddress: schoolAddress || State.profile.schoolAddress || '',
      schoolPhone: schoolPhone || State.profile.schoolPhone || '',
      schoolLogo: _bulletinConfigUploads.schoolLogo || State.profile.schoolLogo || ''
    });

    State.profile.bulletinConfig = bulletinConfig;
    if (schoolName) State.profile.schoolName = schoolName;
    if (schoolAddress) State.profile.schoolAddress = schoolAddress;
    if (schoolPhone) State.profile.schoolPhone = schoolPhone;
    if (_bulletinConfigUploads.schoolLogo) State.profile.schoolLogo = _bulletinConfigUploads.schoolLogo;

    showToast('✅ Configuration des bulletins sauvegardée !', 'success');
    _bulletinConfigUploads = {};
  } catch (e) {
    console.error(e);
    showToast('Erreur de sauvegarde', 'error');
  }
}

// ============================================================
// INSCRIPTION ÉLÈVE AMÉLIORÉE (avec photo de profil obligatoire)
// ============================================================
// Remplace regSchoolStudent pour ajouter photo + infos parent email

async function regSchoolStudentV2(e) {
  e.preventDefault();
  const ln = document.getElementById('stLn')?.value.trim();
  const fn = document.getElementById('stFn')?.value.trim();
  const cls = document.getElementById('stClass')?.value;
  const parentName = document.getElementById('stParent')?.value.trim() || '';
  const parentPh = document.getElementById('stParentPh')?.value.trim() || '';
  const parentEmail = document.getElementById('stParentEmail')?.value.trim() || '';
  const classId = document.getElementById('stClassId')?.value || '';

  if (!ln || !fn || !cls) { showToast('Nom, prénom et classe obligatoires', 'error'); return; }

  const stuId = 'ELEV-' + generateId(6);
  const stuPwd = generatePwd(8);
  const stuEmail = stuId.toUpperCase() + '@neoclass.com';
  const schoolUid = State.user.uid;
  const schoolProfile = { ...State.profile };

  try {
    showToast('⏳ Création du compte élève...', 'info');
    const cred = await auth.createUserWithEmailAndPassword(stuEmail, stuPwd);
    const studentUid = cred.user.uid;

    // Photo de profil si sélectionnée
    let photoURL = '';
    const photoInput = document.getElementById('stPhoto');
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      photoURL = await new Promise(res => {
        reader.onload = e => res(e.target.result);
        reader.readAsDataURL(photoInput.files[0]);
      });
    }

    await db.collection('users').doc(studentUid).set({
      uid: studentUid,
      studentId: stuId.toUpperCase(),
      email: stuEmail,
      fullName: fn + ' ' + ln,
      lastName: ln,
      firstName: fn,
      className: cls,
      classId: classId || '',
      parentName,
      parentPhone: parentPh,
      parentEmail,
      photoURL,
      schoolId: schoolUid,
      schoolName: schoolProfile.schoolName || schoolProfile.fullName || '',
      schoolLogo: schoolProfile.schoolLogo || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      role: 'student',
      isOnline: false,
      isBanned: false,
      videoWatched: false,
      level: cls,
      system: schoolProfile.system || 'guinea',
      totalXP: 0,
      nabecoins: 50,
      streak: 0
    });

    await db.collection('schools').doc(schoolUid).collection('students').add({
      uid: studentUid,
      lastName: ln, firstName: fn, className: cls, classId: classId || '',
      parentName, parentPhone: parentPh, parentEmail, photoURL,
      studentId: stuId.toUpperCase(), studentPwd: stuPwd, schoolId: schoolUid,
      schoolName: schoolProfile.schoolName || schoolProfile.fullName || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      email: stuEmail
    });

    // Mettre à jour le compteur de la classe
    if (classId) {
      await db.collection('classes').doc(classId).update({
        studentCount: firebase.firestore.FieldValue.increment(1)
      });
    }

    await auth.signOut();

    const successModal = `<div class="text-center">
      <div style="font-size:3rem;">🎓</div>
      <h3 class="mt-2">Élève inscrit avec succès!</h3>
      <div class="card mt-2" style="background:rgba(16,185,129,.08);">
        <p><strong>${fn} ${ln}</strong> – ${cls}</p>
        <p style="margin-top:10px;">📧 Email:</p>
        <p><code style="font-size:1rem;color:var(--primary);background:var(--bg);padding:5px 10px;border-radius:5px;">${stuEmail}</code></p>
        <p style="margin-top:10px;">🆔 Identifiant:</p>
        <p><code style="font-size:1.1rem;color:var(--primary);background:var(--bg);padding:5px 10px;border-radius:5px;">${stuId.toUpperCase()}</code></p>
        <p style="margin-top:10px;">🔒 Mot de passe:</p>
        <p><code style="font-size:1.1rem;color:var(--accent);background:var(--bg);padding:5px 10px;border-radius:5px;">${stuPwd}</code></p>
        <p style="margin-top:15px;font-size:.85rem;color:var(--text-secondary);">⚠️ Notez ces informations !</p>
      </div>
      <button class="btn btn-primary mt-3" onclick="closeModal();window.location.reload();">OK - Reconnecter</button>
    </div>`;
    openModal(successModal);
  } catch (e) {
    console.error('Erreur inscription élève:', e);
    showToast('Erreur: ' + (e.message || e), 'error');
  }
}

// Remplacer la page renderSchoolStudents pour inclure les nouvelles fonctionnalités
function renderSchoolStudents(app) {
  if (!State.user || !isSchool()) { navigate('dashboard'); return; }
  const sl = getSidebarLinks('school');
  const sys = State.profile.system || 'guinea';
  const data = eduData[sys];
  const allLevels = [...(data.primary || []), ...(data.middle || []), ...((data.highschool && data.highschool.levels) || [])];

  // Construire les options de classe (niveaux + classes personnalisées)
  const levelOptions = allLevels.map(l => `<option value="${l}">${l}</option>`).join('');

  app.innerHTML = `<div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <div class="flex justify-between items-center mb-3" style="flex-wrap:wrap;gap:12px;">
        <h1 style="font-size:1.6rem;font-weight:800;">🎓 Élèves</h1>
        <button class="btn btn-outline" onclick="navigate('school-classes')">🏫 Voir par classe</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <!-- Formulaire inscription -->
        <div class="card">
          <h3 class="mb-2">Inscrire un élève</h3>
          <form onsubmit="regSchoolStudentV2(event)">
            <!-- Photo de profil -->
            <div class="form-group text-center">
              <label style="display:block;margin-bottom:8px;">📷 Photo de profil</label>
              <div style="position:relative;width:100px;height:100px;margin:0 auto 8px;">
                <div id="stPhotoPreview" style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#fff;overflow:hidden;border:3px solid var(--border);cursor:pointer;" onclick="document.getElementById('stPhoto').click()">
                  <span id="stPhotoPlaceholder">📷</span>
                  <img id="stPhotoImg" src="" style="display:none;width:100%;height:100%;object-fit:cover;" />
                </div>
                <input type="file" id="stPhoto" accept="image/*" style="display:none;" onchange="previewStudentPhoto(this)" />
                <div style="position:absolute;bottom:0;right:0;background:var(--primary);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--bg-card);font-size:.8rem;" onclick="document.getElementById('stPhoto').click()">✏️</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group"><label>Nom *</label><input class="form-input" id="stLn" required /></div>
              <div class="form-group"><label>Prénom *</label><input class="form-input" id="stFn" required /></div>
            </div>
            <div class="form-group">
              <label>Classe *</label>
              <select class="form-input" id="stClass" required onchange="loadClassIdForStudent(this.value)">${levelOptions}</select>
            </div>
            <input type="hidden" id="stClassId" value="" />
            <div class="form-row">
              <div class="form-group"><label>Nom parent</label><input class="form-input" id="stParent" /></div>
              <div class="form-group"><label>Tél parent</label><input class="form-input" id="stParentPh" /></div>
            </div>
            <div class="form-group">
              <label>Email parent (pour recevoir les bulletins)</label>
              <input class="form-input" type="email" id="stParentEmail" placeholder="parent@email.com" />
            </div>
            <button class="btn btn-primary btn-block" type="submit">Inscrire ✅</button>
          </form>
        </div>

        <!-- Liste élèves -->
        <div class="card">
          <div class="flex justify-between items-center mb-2">
            <h3>Élèves inscrits</h3>
          </div>
          <input class="form-input mb-2" id="studentsListSearch" placeholder="🔍 Rechercher..." oninput="filterStudentsList(this.value)" style="font-size:.9rem;" />
          <div id="scStudList"><p style="color:var(--text-secondary);">Chargement...</p></div>
        </div>
      </div>
    </main>
  </div>`;

  loadSchoolStudentsV2();
  loadCustomClassOptions();
}

function previewStudentPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('stPhotoImg');
      const placeholder = document.getElementById('stPhotoPlaceholder');
      if (img) { img.src = e.target.result; img.style.display = 'block'; }
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function loadCustomClassOptions() {
  try {
    const snap = await db.collection('classes').where('schoolId', '==', State.user.uid).get();
    const select = document.getElementById('stClass');
    if (!select) return;
    snap.forEach(doc => {
      const c = doc.data();
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.dataset.classId = doc.id;
      opt.textContent = `${c.name} (${c.level || ''})`;
      select.appendChild(opt);
    });
  } catch (e) {}
}

async function loadClassIdForStudent(className) {
  try {
    const snap = await db.collection('classes').where('schoolId', '==', State.user.uid).where('name', '==', className).limit(1).get();
    const hiddenInput = document.getElementById('stClassId');
    if (hiddenInput) hiddenInput.value = snap.empty ? '' : snap.docs[0].id;
  } catch (e) {}
}

let _allSchoolStudents = [];
async function loadSchoolStudentsV2() {
  try {
    const snap = await db.collection('schools').doc(State.user.uid).collection('students').orderBy('createdAt', 'desc').get();
    const el = document.getElementById('scStudList');
    if (!el) return;
    _allSchoolStudents = [];
    if (snap.empty) { el.innerHTML = '<p style="color:var(--text-secondary);">Aucun élève.</p>'; return; }
    snap.forEach(doc => _allSchoolStudents.push({ id: doc.id, ...doc.data() }));
    renderStudentsListCompact(_allSchoolStudents);
  } catch (e) {
    const el = document.getElementById('scStudList');
    if (el) el.innerHTML = '<p style="color:var(--danger);">Erreur.</p>';
  }
}

function filterStudentsList(q) {
  const filtered = _allSchoolStudents.filter(s =>
    (s.firstName + ' ' + s.lastName).toLowerCase().includes(q.toLowerCase()) ||
    (s.className || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(q.toLowerCase())
  );
  renderStudentsListCompact(filtered);
}

function renderStudentsListCompact(students) {
  const el = document.getElementById('scStudList');
  if (!el) return;
  if (students.length === 0) { el.innerHTML = '<p style="color:var(--text-secondary);">Aucun résultat.</p>'; return; }
  el.innerHTML = students.map(s => `
    <div class="card card-flat mb-2" style="border:1px solid var(--border);padding:10px;cursor:pointer;transition:all .2s;"
         onclick="openStudentProfile('${s.uid || s.id}')"
         onmouseenter="this.style.borderColor='var(--primary)'"
         onmouseleave="this.style.borderColor='var(--border)'">
      <div class="flex items-center gap-2">
        ${s.photoURL
          ? `<img src="${s.photoURL}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />`
          : `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">👤</div>`
        }
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.firstName} ${s.lastName}</div>
          <div style="font-size:.78rem;color:var(--text-secondary);">${s.className || ''} · ${s.studentId || ''}</div>
        </div>
        <span style="font-size:1.2rem;">›</span>
      </div>
    </div>`).join('');
}

// ============================================================
// PUBLICATION DES NOTES – Envoi automatique aux élèves
// ============================================================

// Override calculateAndPublishResults pour ajouter l'envoi automatique
async function calculateAndPublishResults() {
  if (!window.currentClassResults) {
    showToast('Calculez d\'abord les résultats', 'error');
    return;
  }

  const { classId, period, results } = window.currentClassResults;
  const periodLabel = period === 'T1' ? '1er Trimestre' : period === 'T2' ? '2ème Trimestre' : '3ème Trimestre';

  // Vérifications avant publication
  const errors = [];
  if (results.length === 0) errors.push('Aucun résultat à publier');
  const noGrades = results.filter(r => !r.generalAvg || r.generalAvg === 0);
  if (noGrades.length > 0) errors.push(`${noGrades.length} élève(s) sans moyenne`);

  if (errors.length > 0) {
    const html = `<h3>⚠️ Problèmes détectés</h3>
    ${errors.map(e => `<p style="color:#ef4444;">❌ ${e}</p>`).join('')}
    <p class="mt-2">Voulez-vous publier quand même ?</p>
    <div class="flex gap-2 mt-3">
      <button class="btn btn-warning" onclick="closeModal();doPublishResults()">Publier quand même</button>
      <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
    </div>`;
    openModal(html);
    return;
  }

  const confirmHtml = `<h3>🚀 Publier les résultats</h3>
  <p>Vous allez publier les résultats de <b>${results.length} élève(s)</b> pour le <b>${periodLabel}</b>.</p>
  <p class="mt-2">Les élèves recevront une notification automatique.</p>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="closeModal();doPublishResults()">✅ Confirmer et publier</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(confirmHtml);
}

async function doPublishResults() {
  if (!window.currentClassResults) return;
  const { classId, period, results } = window.currentClassResults;
  const periodLabel = period === 'T1' ? '1er Trimestre' : period === 'T2' ? '2ème Trimestre' : '3ème Trimestre';

  try {
    showToast('⏳ Publication en cours...', 'info');
    let published = 0;
    let notified = 0;

    for (const r of results) {
      // Sauvegarder le résultat
      await db.collection('studentResults').doc(`${r.studentId}_${period}`).set({
        studentId: r.studentId,
        schoolId: State.user.uid,
        classId,
        period,
        name: r.name,
        subjectAvgs: r.subjectAvgs,
        generalAvg: r.generalAvg,
        rank: r.rank,
        totalStudents: results.length,
        passed: r.passed,
        publishedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      published++;

      // Envoyer notification à l'élève
      try {
        await db.collection('messages').add({
          recipientId: r.studentId,
          senderId: State.user.uid,
          senderName: State.profile.schoolName || State.profile.fullName || 'École',
          schoolId: State.user.uid,
          type: 'school',
          title: `📊 Vos résultats – ${periodLabel}`,
          body: `Bonjour ${r.name}, vos résultats du ${periodLabel} sont disponibles. Moyenne générale: ${r.generalAvg}/20. ${r.passed ? '✅ Vous êtes admis(e).' : '❌ Résultat insuffisant.'} Consultez votre bulletin complet dans l'application.`,
          period,
          generalAvg: r.generalAvg,
          passed: r.passed,
          bulletinAvailable: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          read: false
        });
        notified++;
      } catch (ne) { console.warn('Notification échouée pour', r.studentId); }
    }

    showToast(`✅ ${published} résultats publiés ! ${notified} élèves notifiés.`, 'success');
    window.currentClassResults = null;

  } catch (e) {
    console.error(e);
    showToast('Erreur de publication', 'error');
  }
}

// ============================================================
// MISE À JOUR DU ROUTEUR — ajouter les nouvelles pages
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Patcher le routeur
    if (typeof pages !== 'undefined') {
      pages['school-classes'] = renderSchoolClasses;
      pages['school-bulletin-config'] = renderBulletinConfig;
    }

    // Patcher le sidebar school pour ajouter Gestion Classes et Config Bulletins
    const origGetSidebarLinks = window.getSidebarLinks;
    if (origGetSidebarLinks) {
      window.getSidebarLinks = function(role) {
        const result = origGetSidebarLinks(role);
        return result;
      };
    }

    // Patcher navigate pour supporter les nouvelles pages
    const origNavigate = window.navigate;
    if (origNavigate) {
      window.navigate = function(page, params) {
        if (page === 'school-classes') {
          const app = document.getElementById('app');
          if (app) renderSchoolClasses(app);
          return;
        }
        if (page === 'school-bulletin-config') {
          const app = document.getElementById('app');
          if (app) renderBulletinConfig(app);
          return;
        }
        return origNavigate(page, params);
      };
    }
  }, 1000);
});

// ============================================================
// AJOUTER LES NOUVELLES ENTRÉES AU MENU ÉCOLE
// — Injection dans le HTML du sidebar
// ============================================================
const _origGetSidebarLinksForSchool = null; // sera utilisé après chargement

// Hook sur getSidebarLinks pour injecter tous les nouveaux liens
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Observer les changements de contenu de la sidebar pour injecter les liens
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;

      // Vérifier si les liens école existent et si les nôtres ne sont pas déjà là
      const hasSchoolStudents = sidebar.querySelector('[onclick*="school-students"]');
      const hasClasses = sidebar.querySelector('[onclick*="school-classes"]');

      if (hasSchoolStudents && !hasClasses && State.profile?.role === 'school') {
        const link = sidebar.querySelector('[onclick*="school-students"]');
        if (link) {
          // Gestion Classes
          const classLink = document.createElement('a');
          classLink.className = link.className;
          classLink.setAttribute('onclick', "navigate('school-classes')");
          classLink.innerHTML = '🏫 Gestion Classes';
          classLink.style.cssText = link.style.cssText || '';
          link.parentNode.insertBefore(classLink, link.nextSibling);

          // Professeurs
          if (!sidebar.querySelector('[onclick*="school-teachers"]')) {
            const teachLink = document.createElement('a');
            teachLink.className = link.className;
            teachLink.setAttribute('onclick', "navigate('school-teachers')");
            teachLink.innerHTML = '👨‍🏫 Professeurs';
            teachLink.style.cssText = link.style.cssText || '';
            classLink.parentNode.insertBefore(teachLink, classLink.nextSibling);
          }

          // Dirigeants
          if (!sidebar.querySelector('[onclick*="school-directors"]')) {
            const dirLink = document.createElement('a');
            dirLink.className = link.className;
            dirLink.setAttribute('onclick', "navigate('school-directors')");
            dirLink.innerHTML = '🎓 Dirigeants';
            dirLink.style.cssText = link.style.cssText || '';
            classLink.parentNode.insertBefore(dirLink, classLink.nextSibling);
          }

          // Config Bulletins
          const bulletinSnap = sidebar.querySelector('[onclick*="school-bulletins"]');
          if (bulletinSnap && !sidebar.querySelector('[onclick*="school-bulletin-config"]')) {
            const bulletinConfigLink = document.createElement('a');
            bulletinConfigLink.className = link.className;
            bulletinConfigLink.setAttribute('onclick', "navigate('school-bulletin-config')");
            bulletinConfigLink.innerHTML = '🎨 Config Bulletins';
            bulletinSnap.parentNode.insertBefore(bulletinConfigLink, bulletinSnap.nextSibling);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }, 500);
});

// ============================================================
// GESTION DES PROFESSEURS – Avec photos et assignation aux classes
// ============================================================
// GESTION DES PROFESSEURS – Interface Améliorée avec Photos
// ============================================================
async function renderTeachersManagement(app) {
  if (!State || !State.user) { 
    setTimeout(() => navigate('dashboard'), 100); 
    return; 
  }
  
  const sl = getSidebarLinks('school');
  
  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
        <h1 style="font-size:1.8rem;font-weight:800;">👨‍🏫 Gestion des Professeurs</h1>
        <span class="badge" style="background:var(--primary);color:#fff;font-size:1rem;padding:8px 12px;" id="teacherCount">0 profs</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-top:20px;">
        <!-- FORMULAIRE PROFESSEUR -->
        <div class="card" style="padding:24px;height:fit-content;position:sticky;top:20px;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:12px;">
            ➕ Ajouter un professeur
          </h3>
          
          <form onsubmit="saveTeacher(event)">
            <!-- Photo upload -->
            <div style="text-align:center;margin-bottom:24px;">
              <label style="display:block;margin-bottom:12px;font-weight:600;color:var(--text);">📷 Photo du professeur</label>
              <div id="teachPhotoPreview" 
                   style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#6358f5,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:3rem;color:#fff;overflow:hidden;border:4px solid var(--border);cursor:pointer;margin:0 auto;transition:all .3s ease;"
                   onclick="document.getElementById('teachPhoto').click()"
                   onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 20px rgba(0,0,0,.2)'"
                   onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
                👨‍🏫
              </div>
              <input type="file" id="teachPhoto" accept="image/*" style="display:none;" onchange="previewTeacherPhoto(this)" />
              <small style="display:block;margin-top:8px;color:var(--text-secondary);">Clic pour changer</small>
            </div>

            <!-- Infos de base -->
            <div class="form-group">
              <label style="font-weight:600;">Nom complet *</label>
              <input class="form-input" id="teachName" placeholder="Jean Dupont" required style="padding:12px;border-radius:8px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Titre *</label>
              <select class="form-input" id="teachTitle" required style="padding:12px;border-radius:8px;">
                <option value="">-- Sélectionner --</option>
                <option value="Professeur">Professeur</option>
                <option value="Maître">Maître</option>
                <option value="Maîtresse">Maîtresse</option>
                <option value="Instituteur">Instituteur</option>
                <option value="Institutrice">Institutrice</option>
                <option value="Prof Principal">Prof Principal</option>
              </select>
            </div>

            <!-- Contact -->
            <div class="form-group">
              <label style="font-weight:600;">Email</label>
              <input class="form-input" type="email" id="teachEmail" placeholder="prof@ecole.com" style="padding:12px;border-radius:8px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Téléphone</label>
              <input class="form-input" id="teachPhone" placeholder="+224 6XX XX XX XX" style="padding:12px;border-radius:8px;" />
            </div>

            <!-- Matière -->
            <div class="form-group">
              <label style="font-weight:600;">Matière(s) *</label>
              <input class="form-input" id="teachSubject" placeholder="Mathématiques, Français..." required style="padding:12px;border-radius:8px;" />
            </div>

            <!-- Classes assignées -->
            <div class="form-group">
              <label style="font-weight:600;">Classes assignées *</label>
              <select class="form-input" id="teachClasses" multiple required style="padding:12px;border-radius:8px;height:120px;">
                <option value="">-- Sélectionner les classes --</option>
              </select>
              <small style="display:block;margin-top:8px;color:var(--text-secondary);">👉 Ctrl+Clic pour sélectionner plusieurs</small>
            </div>

            <!-- Identifiants générés automatiquement -->
            <div style="background:rgba(99,88,245,.08);padding:12px;border-radius:8px;margin:20px 0;border:1px solid var(--primary);">
              <div style="font-size:.9rem;font-weight:600;color:var(--text);margin-bottom:8px;">🔑 Identifiants (auto-générés)</div>
              <div style="font-size:.85rem;color:var(--text-secondary);margin-bottom:6px;">
                ID: <code id="teachIdDisplay" style="background:var(--bg);padding:4px 8px;border-radius:4px;font-family:monospace;color:var(--primary);">PROF-0000</code>
              </div>
              <div style="font-size:.85rem;color:var(--text-secondary);">
                Mot de passe: <code id="teachPwdDisplay" style="background:var(--bg);padding:4px 8px;border-radius:4px;font-family:monospace;color:var(--primary);">Abc123!@9</code>
              </div>
            </div>

            <!-- Bouton submit -->
            <button class="btn btn-primary btn-block" type="submit" 
                    style="padding:14px;font-weight:700;font-size:1rem;border-radius:8px;margin-top:20px;cursor:pointer;transition:all .2s;">
              ✅ Enregistrer le professeur
            </button>
          </form>
        </div>

        <!-- LISTE PROFESSEURS -->
        <div class="card" style="padding:24px;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:12px;">
            👥 Professeurs de l'école
          </h3>

          <!-- Recherche -->
          <div style="margin-bottom:20px;">
            <input class="form-input" id="teachersSearch" 
                   placeholder="🔍 Chercher par nom ou matière..." 
                   oninput="filterTeachers(this.value)" 
                   style="padding:12px;border-radius:8px;" />
          </div>

          <!-- Liste -->
          <div id="teachersList" style="max-height:600px;overflow-y:auto;">
            <p style="color:var(--text-secondary);text-align:center;padding:40px;">⏳ Chargement des professeurs...</p>
          </div>
        </div>
      </div>
    </main>
  </div>`;

  // Charger les données
  setTimeout(() => {
    loadTeachersClasses();
    loadTeachers();
  }, 600);
}

let _teacherPhotoBase64 = null;
function previewTeacherPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _teacherPhotoBase64 = e.target.result;
      const preview = document.getElementById('teachPhotoPreview');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function loadTeachersClasses() {
  try {
    const snap = await db.collection('classes').where('schoolId', '==', State.user.uid).get();
    const select = document.getElementById('teachClasses');
    if (!select) return;
    
    // Vider le select
    select.innerHTML = '<option value="">-- Sélectionner les classes --</option>';
    
    snap.forEach(doc => {
      const c = doc.data();
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${c.name} (${c.level})`;
      select.appendChild(opt);
    });

    // Générer l'ID et mot de passe au chargement
    generateTeacherCredentials();
  } catch (e) { console.error(e); }
}

function generateTeacherCredentials() {
  // Générer ID unique: PROF-XXXXX
  const num = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  const teacherId = 'PROF-' + num;
  
  // Générer mot de passe: 8 caractères (Maj + min + chiffre + spécial)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 9; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Afficher dans le formulaire
  document.getElementById('teachIdDisplay').textContent = teacherId;
  document.getElementById('teachPwdDisplay').textContent = pwd;
  
  // Stocker globalement pour saveTeacher()
  window._currentTeacherId = teacherId;
  window._currentTeacherPwd = pwd;
}

async function saveTeacher(e) {
  e.preventDefault();
  const name = document.getElementById('teachName')?.value.trim();
  const title = document.getElementById('teachTitle')?.value;
  const email = document.getElementById('teachEmail')?.value.trim() || '';
  const phone = document.getElementById('teachPhone')?.value.trim() || '';
  const subject = document.getElementById('teachSubject')?.value.trim() || '';
  
  // Récupérer les classes sélectionnées
  const classSelect = document.getElementById('teachClasses');
  const selectedClasses = Array.from(classSelect.selectedOptions).map(opt => ({
    id: opt.value,
    name: opt.textContent
  }));

  if (!name || !title || !subject || selectedClasses.length === 0) { 
    showToast('❌ Remplissez: Nom, Titre, Matière, Classes', 'error'); 
    return; 
  }

  try {
    showToast('⏳ Enregistrement...', 'info');
    
    // Récupérer l'ID et mot de passe générés
    const teacherId = window._currentTeacherId || 'PROF-' + Math.floor(Math.random() * 99999);
    const teacherPwd = window._currentTeacherPwd || 'Abc123!@';
    
    await db.collection('teachers').add({
      schoolId: State.user.uid,
      name,
      title,
      email,
      phone,
      subjects: subject.split(',').map(s => s.trim()).filter(s => s),
      classIds: selectedClasses.map(c => c.id), // IDs des classes
      classNames: selectedClasses.map(c => c.name), // Noms des classes
      teacherId, // ID unique pour le prof
      teacherPassword: teacherPwd, // Mot de passe
      photoURL: _teacherPhotoBase64 || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      dateAdded: new Date().toLocaleDateString('fr-FR')
    });

    // Afficher les infos de connexion
    const modal = `
      <div style="text-align:center;padding:20px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">✅</div>
        <h2 style="margin-bottom:20px;">Professeur enregistré!</h2>
        
        <div style="background:rgba(99,88,245,.1);padding:20px;border-radius:12px;margin:20px 0;border:2px solid var(--primary);">
          <h3 style="margin-bottom:16px;font-weight:700;">🔑 Identifiants de connexion</h3>
          
          <div style="margin-bottom:16px;">
            <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:6px;">👤 Nom du professeur</div>
            <code style="display:block;background:var(--bg);padding:12px;border-radius:8px;font-size:1.1rem;font-weight:700;color:var(--primary);font-family:monospace;margin-bottom:12px;">
              ${name}
            </code>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:6px;">🆔 ID de connexion</div>
            <code style="display:block;background:var(--bg);padding:12px;border-radius:8px;font-size:1.1rem;font-weight:700;color:var(--primary);font-family:monospace;margin-bottom:12px;">
              ${teacherId}
            </code>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:6px;">🔒 Mot de passe</div>
            <code style="display:block;background:var(--bg);padding:12px;border-radius:8px;font-size:1.1rem;font-weight:700;color:#e74c3c;font-family:monospace;margin-bottom:12px;">
              ${teacherPwd}
            </code>
          </div>

          <div style="margin-top:20px;padding:16px;background:rgba(255,193,7,.1);border-radius:8px;border-left:4px solid #ffc107;">
            <div style="font-size:.9rem;color:var(--text);">
              📌 <strong>À communiquer au professeur!</strong><br>
              <small style="color:var(--text-secondary);">⚠️ Conservez ces identifiants dans un endroit sûr.</small>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;padding:16px;background:var(--bg-2);border-radius:8px;">
          <h4 style="margin-bottom:12px;font-weight:700;">📚 Classes assignées (${selectedClasses.length})</h4>
          <div style="text-align:left;font-size:.95rem;">
            ${selectedClasses.map(c => `<div style="padding:6px 0;">✓ ${c.name}</div>`).join('')}
          </div>
        </div>

        <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-secondary" onclick="closeModal()" style="padding:12px 24px;border-radius:8px;">
            Fermer
          </button>
          <button class="btn btn-primary" onclick="closeModal();loadTeachers();generateTeacherCredentials();" style="padding:12px 24px;border-radius:8px;">
            Ajouter un autre
          </button>
        </div>
      </div>
    `;
    
    openModal(modal);
    
    // Réinitialiser le formulaire
    _teacherPhotoBase64 = null;
    document.querySelector('form')?.reset();
    document.getElementById('teachPhotoPreview').innerHTML = '👨‍🏫';
    generateTeacherCredentials(); // Générer de nouvelles credentials
    
  } catch (e) {
    console.error(e);
    showToast('❌ Erreur: ' + e.message, 'error');
  }
}

let _allTeachers = [];
async function loadTeachers() {
  try {
    // Vérifier que State.user existe
    if (!State || !State.user || !State.user.uid) {
      console.error('loadTeachers: State.user undefined');
      const el = document.getElementById('teachersList');
      if (el) el.innerHTML = '<p style="color:var(--danger);">⚠️ Session expirée. Rechargez la page.</p>';
      return;
    }

    // Charger sans orderBy pour éviter l'index composite
    const snap = await db.collection('teachers').where('schoolId', '==', State.user.uid).get();
    _allTeachers = [];
    snap.forEach(doc => _allTeachers.push({ id: doc.id, ...doc.data() }));
    
    // Trier côté client (createdAt DESC)
    _allTeachers.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(0);
      const timeB = b.createdAt?.toDate?.() || new Date(0);
      return timeB - timeA; // DESC
    });
    
    // Mettre à jour le compteur
    const badge = document.getElementById('teacherCount');
    if (badge) badge.textContent = _allTeachers.length + ' prof' + (_allTeachers.length > 1 ? 's' : '');
    
    renderTeachersList(_allTeachers);
  } catch (e) {
    console.error('loadTeachers erreur:', e);
    const el = document.getElementById('teachersList');
    if (el) el.innerHTML = '<p style="color:var(--danger);">❌ Erreur: ' + (e.message || 'Impossible de charger') + '</p>';
  }
}

function filterTeachers(q) {
  const query = q.toLowerCase();
  const filtered = _allTeachers.filter(t =>
    t.name.toLowerCase().includes(query) ||
    (t.title || '').toLowerCase().includes(query) ||
    (t.subjects || []).some(s => s.toLowerCase().includes(query)) ||
    (t.email || '').toLowerCase().includes(query)
  );
  renderTeachersList(filtered);
}

function renderTeachersList(teachers) {
  const el = document.getElementById('teachersList');
  if (!el) return;

  if (teachers.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">
      <div style="font-size:2rem;margin-bottom:12px;">📭</div>
      <p>Aucun professeur trouvé</p>
    </div>`;
    return;
  }

  let html = '';
  teachers.forEach(t => {
    const photo = t.photoURL 
      ? `<img src="${t.photoURL}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--primary);" />`
      : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#6358f5,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;border:2px solid var(--primary);">👨‍🏫</div>`;

    html += `<div class="card" style="padding:16px;margin-bottom:12px;border:1px solid var(--border);cursor:pointer;transition:all .2s;" 
                 onclick="openTeacherDetail('${t.id}', '${t.name}')"
                 onmouseenter="this.style.borderColor='var(--primary)';this.style.boxShadow='0 2px 8px rgba(0,0,0,.1)'"
                 onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        ${photo}
        <div style="flex:1;">
          <div style="font-weight:700;font-size:1.05rem;">${t.name}</div>
          ${t.title ? `<div style="font-size:.9rem;color:var(--primary);font-weight:600;">📍 ${t.title}</div>` : ''}
          <div style="font-size:.9rem;color:var(--text-secondary);margin:6px 0;">
            📚 ${(t.subjects || []).join(', ') || 'N/A'}
          </div>
          ${t.email ? `<div style="font-size:.85rem;color:var(--text-secondary);">📧 ${t.email}</div>` : ''}
          ${t.phone ? `<div style="font-size:.85rem;color:var(--text-secondary);">📞 ${t.phone}</div>` : ''}
          ${t.classNames && t.classNames.length > 0 ? `
            <div style="margin-top:8px;padding:8px;background:rgba(99,88,245,.08);border-radius:6px;font-size:.85rem;">
              <div style="font-weight:600;margin-bottom:4px;">📌 Classes:</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${t.classNames.map(cn => `<span style="background:var(--primary);color:#fff;padding:3px 8px;border-radius:4px;font-size:.8rem;">${cn}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${t.teacherId ? `<div style="font-size:.8rem;color:#666;margin-top:6px;">ID: <code style="background:var(--bg);padding:2px 6px;border-radius:3px;">${t.teacherId}</code></div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteTeacher('${t.id}')" 
                style="padding:6px 12px;font-size:.9rem;">🗑️</button>
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

async function deleteTeacher(teacherId) {
  if (!confirm('Supprimer ce professeur ?')) return;
  try {
    await db.collection('teachers').doc(teacherId).delete();
    showToast('Professeur supprimé', 'success');
    loadTeachers();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

async function openTeacherDetail(teacherId, teacherName) {
  try {
    // Récupérer les infos du prof
    const docSnap = await db.collection('teachers').doc(teacherId).get();
    if (!docSnap.exists) return;
    const teacher = { id: docSnap.id, ...docSnap.data() };

    // Récupérer les classes du prof
    const classesSnap = await db.collection('classes')
      .where('schoolId', '==', State.user.uid)
      .where('profId', '==', teacherId)
      .get();
    const classes = [];
    classesSnap.forEach(doc => classes.push({ id: doc.id, ...doc.data() }));

    // Compter les élèves
    let totalStudents = 0;
    for (const cls of classes) {
      const studSnap = await db.collection('classes').doc(cls.id).collection('students').get();
      totalStudents += studSnap.size;
    }

    // Récupérer les devoirs du prof
    const homeworkSnap = await db.collection('assignments')
      .where('teacherId', '==', teacherId)
      .get();
    const homeworks = [];
    homeworkSnap.forEach(doc => homeworks.push({ id: doc.id, ...doc.data() }));

    // Récupérer les comptes-rendus du prof
    const reportsSnap = await db.collection('courseReports')
      .where('teacherId', '==', teacherId)
      .get();
    const reports = [];
    reportsSnap.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));

    const photo = teacher.photoURL 
      ? `<img src="${teacher.photoURL}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);" />`
      : `<div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#6358f5,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:3rem;color:#fff;">👨‍🏫</div>`;

    let html = `
      <div style="max-height:90vh;overflow-y:auto;padding:20px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px;">
          <!-- Infos prof -->
          <div style="text-align:center;">
            ${photo}
            <h2 style="margin-top:16px;margin-bottom:4px;">${teacher.name}</h2>
            <div style="font-size:1.1rem;color:var(--primary);font-weight:600;margin-bottom:12px;">📍 ${teacher.title || 'Professeur'}</div>
            ${teacher.email ? `<div style="font-size:.95rem;margin:6px 0;">📧 ${teacher.email}</div>` : ''}
            ${teacher.phone ? `<div style="font-size:.95rem;margin:6px 0;">📞 ${teacher.phone}</div>` : ''}
            <div style="font-size:.95rem;margin-top:12px;color:var(--text-secondary);">
              📚 ${(teacher.subjects || []).join(', ') || 'N/A'}
            </div>
          </div>

          <!-- Stats -->
          <div>
            <h3 style="font-weight:700;margin-bottom:16px;border-bottom:2px solid var(--primary);padding-bottom:8px;">📊 Statistiques</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div style="background:rgba(99,88,245,.1);padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:var(--primary);">${classes.length}</div>
                <div style="font-size:.9rem;color:var(--text-secondary);">Classes</div>
              </div>
              <div style="background:rgba(16,185,129,.1);padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:#10b981;">${totalStudents}</div>
                <div style="font-size:.9rem;color:var(--text-secondary);">Élèves</div>
              </div>
              <div style="background:rgba(245,158,11,.1);padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:#f59e0b;">${homeworks.length}</div>
                <div style="font-size:.9rem;color:var(--text-secondary);">Devoirs</div>
              </div>
              <div style="background:rgba(59,130,246,.1);padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:#3b82f6;">${reports.length}</div>
                <div style="font-size:.9rem;color:var(--text-secondary);">Comptes-rendus</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglets -->
        <div style="margin-top:30px;">
          <div style="display:flex;gap:12px;margin-bottom:20px;border-bottom:2px solid var(--border);flex-wrap:wrap;">
            <button class="tab-btn" onclick="switchTeacherTab('classes', this)" style="padding:12px 20px;background:var(--primary);color:#fff;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;">
              📚 Classes (${classes.length})
            </button>
            <button class="tab-btn" onclick="switchTeacherTab('homework', this)" style="padding:12px 20px;background:transparent;color:var(--text);border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;">
              📝 Devoirs (${homeworks.length})
            </button>
            <button class="tab-btn" onclick="switchTeacherTab('reports', this)" style="padding:12px 20px;background:transparent;color:var(--text);border:none;border-radius:8px 8px 0 0;cursor:pointer;font-weight:600;">
              📋 Comptes-rendus (${reports.length})
            </button>
          </div>

          <!-- Contenu onglets -->
          <div id="teacherTabContent">
            <div id="classesTab">
              ${classes.length === 0 ? '<p style="text-align:center;color:var(--text-secondary);">Aucune classe assignée</p>' : `
                <div style="display:grid;gap:12px;">
                  ${classes.map(c => `
                    <div style="background:var(--bg-2);padding:16px;border-radius:8px;border-left:4px solid var(--primary);">
                      <div style="font-weight:700;font-size:1.05rem;">${c.name}</div>
                      <div style="font-size:.9rem;color:var(--text-secondary);">Niveau ${c.level} • ${c.students?.length || 0} élèves</div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <div id="homeworkTab" style="display:none;">
              ${homeworks.length === 0 ? '<p style="text-align:center;color:var(--text-secondary);">Aucun devoir</p>' : `
                <div style="display:grid;gap:12px;">
                  ${homeworks.map(h => `
                    <div style="background:var(--bg-2);padding:16px;border-radius:8px;border-left:4px solid #f59e0b;">
                      <div style="font-weight:700;font-size:1.05rem;">${h.title || 'Devoir sans titre'}</div>
                      <div style="font-size:.9rem;color:var(--text-secondary);margin-top:8px;">${h.description || ''}</div>
                      <div style="font-size:.85rem;color:#666;margin-top:8px;">
                        📅 Date limite: ${h.dueDate ? new Date(h.dueDate.toDate?.() || h.dueDate).toLocaleDateString('fr-FR') : 'N/A'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <div id="reportsTab" style="display:none;">
              ${reports.length === 0 ? '<p style="text-align:center;color:var(--text-secondary);">Aucun compte-rendu</p>' : `
                <div style="display:grid;gap:12px;">
                  ${reports.map(r => `
                    <div style="background:var(--bg-2);padding:16px;border-radius:8px;border-left:4px solid #3b82f6;">
                      <div style="font-weight:700;font-size:1.05rem;">${r.className || 'Classe'} - ${r.date || ''}</div>
                      <div style="font-size:.9rem;color:var(--text-secondary);margin-top:8px;line-height:1.5;">${r.content || 'Aucun détail'}</div>
                      ${r.attendance ? `<div style="font-size:.85rem;margin-top:8px;">👥 Présents: ${r.attendance.present || 0} / ${r.attendance.total || 0}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>

        <div style="margin-top:24px;display:flex;gap:12px;">
          <button class="btn btn-secondary" onclick="closeModal()" style="flex:1;padding:12px;border-radius:8px;">
            ✕ Fermer
          </button>
          <button class="btn btn-primary" onclick="editTeacher('${teacherId}')" style="flex:1;padding:12px;border-radius:8px;">
            ✏️ Éditer
          </button>
        </div>
      </div>
    `;

    openModal(html);
  } catch (e) {
    console.error('openTeacherDetail:', e);
    showToast('Erreur: ' + e.message, 'error');
  }
}

function switchTeacherTab(tab, el) {
  // Réinitialiser tous les onglets
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = 'var(--text)';
  });
  // Activer l'onglet cliqué
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';

  // Afficher/masquer le contenu
  document.getElementById('classesTab').style.display = tab === 'classes' ? 'block' : 'none';
  document.getElementById('homeworkTab').style.display = tab === 'homework' ? 'block' : 'none';
  document.getElementById('reportsTab').style.display = tab === 'reports' ? 'block' : 'none';
}

async function editTeacher(teacherId) {
  const doc = await db.collection('teachers').doc(teacherId).get();
  if (!doc.exists) return;
  const t = doc.data();
  const html = `
  <h3>✏️ Modifier professeur</h3>
  <div class="form-group mt-3">
    <label>Nom</label>
    <input class="form-input" id="editTeachName" value="${t.name || ''}" />
  </div>
  <div class="form-group">
    <label>Email</label>
    <input class="form-input" type="email" id="editTeachEmail" value="${t.email || ''}" />
  </div>
  <div class="form-group">
    <label>Téléphone</label>
    <input class="form-input" id="editTeachPhone" value="${t.phone || ''}" />
  </div>
  <div class="form-group">
    <label>Matière(s)</label>
    <input class="form-input" id="editTeachSubject" value="${(t.subjects || []).join(', ')}" />
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="updateTeacher('${teacherId}')">💾 Sauvegarder</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

async function updateTeacher(teacherId) {
  const name = document.getElementById('editTeachName')?.value.trim();
  if (!name) { showToast('Nom requis', 'error'); return; }
  try {
    await db.collection('teachers').doc(teacherId).update({
      name,
      email: document.getElementById('editTeachEmail')?.value.trim() || '',
      phone: document.getElementById('editTeachPhone')?.value.trim() || '',
      subjects: (document.getElementById('editTeachSubject')?.value || '').split(',').map(s => s.trim()).filter(s => s)
    });
    showToast('✅ Professeur modifié !', 'success');
    closeModal();
    loadTeachers();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

// ============================================================
// GESTION DES DIRIGEANTS – Directeur, Sous-directeur, etc.
// ============================================================
async function renderDirectorsManagement(app) {
  if (!State || !State.user) { 
    setTimeout(() => navigate('dashboard'), 100); 
    return; 
  }
  const sl = getSidebarLinks('school');

  app.innerHTML = `
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <h1 style="font-size:1.6rem;font-weight:800;" class="mb-3">🎓 Gestion des Dirigeants</h1>
      <p style="color:var(--text-secondary);margin-bottom:20px;">Directeur, sous-directeur et autres cadres</p>

      <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;">
        <!-- Ajout dirigeant -->
        <div class="card">
          <h3 class="mb-2">Ajouter un cadre</h3>
          <form onsubmit="saveDirector(event)">
            <div class="form-group text-center">
              <label style="display:block;margin-bottom:8px;">📷 Photo</label>
              <div id="dirPhotoPreview" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;overflow:hidden;border:3px solid var(--border);cursor:pointer;margin:0 auto 8px;" onclick="document.getElementById('dirPhoto').click()">
                👔
              </div>
              <input type="file" id="dirPhoto" accept="image/*" style="display:none;" onchange="previewDirectorPhoto(this)" />
            </div>
            <div class="form-group">
              <label>Nom complet *</label>
              <input class="form-input" id="dirName" required />
            </div>
            <div class="form-group">
              <label>Poste *</label>
              <select class="form-input" id="dirPosition" required>
                <option value="">-- Sélectionner --</option>
                <option value="Directeur">Directeur</option>
                <option value="Sous-directeur">Sous-directeur</option>
                <option value="Chef de cycle">Chef de cycle</option>
                <option value="Coordonnateur pédagogique">Coordonnateur pédagogique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="form-input" type="email" id="dirEmail" />
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input class="form-input" id="dirPhone" />
            </div>
            <button class="btn btn-primary btn-block" type="submit">Ajouter ✅</button>
          </form>
        </div>

        <!-- Liste cadres -->
        <div class="card">
          <h3 class="mb-2">Cadres de l'établissement</h3>
          <div id="directorsList"><p style="color:var(--text-secondary);">Chargement...</p></div>
        </div>
      </div>
    </main>
  </div>`;

  loadDirectors();
}

let _directorPhotoBase64 = null;
function previewDirectorPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _directorPhotoBase64 = e.target.result;
      const preview = document.getElementById('dirPhotoPreview');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveDirector(e) {
  e.preventDefault();
  const name = document.getElementById('dirName')?.value.trim();
  const position = document.getElementById('dirPosition')?.value;
  const email = document.getElementById('dirEmail')?.value.trim() || '';
  const phone = document.getElementById('dirPhone')?.value.trim() || '';

  if (!name || !position) { showToast('Nom et poste requis', 'error'); return; }

  try {
    await db.collection('directors').add({
      schoolId: State.user.uid,
      name,
      position,
      email,
      phone,
      photoURL: _directorPhotoBase64 || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
    showToast('✅ Cadre ajouté !', 'success');
    _directorPhotoBase64 = null;
    document.querySelector('form')?.reset();
    document.getElementById('dirPhotoPreview').innerHTML = '👔';
    loadDirectors();
  } catch (e) {
    console.error(e);
    showToast('Erreur', 'error');
  }
}

let _allDirectors = [];
async function loadDirectors() {
  try {
    const snap = await db.collection('directors').where('schoolId', '==', State.user.uid).orderBy('createdAt', 'desc').get();
    _allDirectors = [];
    snap.forEach(doc => _allDirectors.push({ id: doc.id, ...doc.data() }));
    renderDirectorsList(_allDirectors);
  } catch (e) {
    const el = document.getElementById('directorsList');
    if (el) el.innerHTML = '<p style="color:var(--danger);">Erreur.</p>';
  }
}

function renderDirectorsList(directors) {
  const el = document.getElementById('directorsList');
  if (!el) return;
  if (directors.length === 0) {
    el.innerHTML = '<p style="color:var(--text-secondary);">Aucun cadre.</p>';
    return;
  }
  el.innerHTML = directors.map(d => `
    <div class="card card-flat mb-2" style="border:1px solid var(--border);padding:12px;cursor:pointer;transition:all .2s;"
         onmouseenter="this.style.borderColor='var(--primary)'"
         onmouseleave="this.style.borderColor='var(--border)'"
         onclick="editDirector('${d.id}')">
      <div class="flex items-center gap-3">
        ${d.photoURL
          ? `<img src="${d.photoURL}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
          : `<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">👔</div>`
        }
        <div style="flex:1;">
          <div style="font-weight:700;">${d.name}</div>
          <div style="font-size:.8rem;color:var(--text-secondary);">📍 ${d.position}</div>
          ${d.email ? `<div style="font-size:.75rem;color:var(--text-secondary);">📧 ${d.email}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteDirector('${d.id}')">🗑️</button>
      </div>
    </div>`).join('');
}

async function deleteDirector(directorId) {
  if (!confirm('Supprimer ce cadre ?')) return;
  try {
    await db.collection('directors').doc(directorId).delete();
    showToast('Cadre supprimé', 'success');
    loadDirectors();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

async function editDirector(directorId) {
  const doc = await db.collection('directors').doc(directorId).get();
  if (!doc.exists) return;
  const d = doc.data();
  const html = `
  <h3>✏️ Modifier cadre</h3>
  <div class="form-group mt-3">
    <label>Nom</label>
    <input class="form-input" id="editDirName" value="${d.name || ''}" />
  </div>
  <div class="form-group">
    <label>Poste</label>
    <input class="form-input" id="editDirPosition" value="${d.position || ''}" />
  </div>
  <div class="form-group">
    <label>Email</label>
    <input class="form-input" type="email" id="editDirEmail" value="${d.email || ''}" />
  </div>
  <div class="form-group">
    <label>Téléphone</label>
    <input class="form-input" id="editDirPhone" value="${d.phone || ''}" />
  </div>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="updateDirector('${directorId}')">💾 Sauvegarder</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;
  openModal(html);
}

async function updateDirector(directorId) {
  const name = document.getElementById('editDirName')?.value.trim();
  if (!name) { showToast('Nom requis', 'error'); return; }
  try {
    await db.collection('directors').doc(directorId).update({
      name,
      position: document.getElementById('editDirPosition')?.value.trim() || '',
      email: document.getElementById('editDirEmail')?.value.trim() || '',
      phone: document.getElementById('editDirPhone')?.value.trim() || ''
    });
    showToast('✅ Cadre modifié !', 'success');
    closeModal();
    loadDirectors();
  } catch (e) {
    showToast('Erreur', 'error');
  }
}

// ============================================================
// ENVOYER DES NOTES À PLUSIEURS ÉLÈVES – Bulk Send Notes
// ============================================================
async function openBulkSendNotesModal(classId) {
  const classDoc = await db.collection('classes').doc(classId).get();
  if (!classDoc.exists) { showToast('Classe introuvable', 'error'); return; }
  const classData = classDoc.data();

  // Charger les élèves de la classe
  const snap = await db.collection('users').where('classId', '==', classId).where('role', '==', 'student').get();
  const students = [];
  snap.forEach(doc => students.push({ id: doc.id, ...doc.data() }));

  if (students.length === 0) {
    showToast('Aucun élève dans cette classe', 'warning');
    return;
  }

  const periods = ['T1', 'T2', 'T3'];
  const periodLabel = { T1: '1er Trimestre', T2: '2ème Trimestre', T3: '3ème Trimestre' };

  let html = `<h3>📨 Envoyer les notes à la classe</h3>
  <p>Classe: <b>${classData.name}</b> (${students.length} élève(s))</p>
  <div class="form-group mt-3">
    <label>Trimestre à envoyer *</label>
    <select class="form-input" id="bulkSendPeriod">
      <option value="">-- Sélectionner --</option>
      ${periods.map(p => `<option value="${p}">${periodLabel[p]}</option>`).join('')}
    </select>
  </div>

  <div class="card mb-3" style="background:rgba(245,158,11,.08);">
    <p style="font-size:.9rem;color:#f59e0b;">⚠️ <b>Avant d'envoyer:</b></p>
    <ul style="font-size:.85rem;color:#666;padding-left:20px;margin:8px 0;">
      <li>✅ Vérifier que TOUS les élèves ont des notes</li>
      <li>✅ Vérifier qu'il n'y a pas d'erreurs dans les bulletins</li>
      <li>✅ S'assurer que les emails parents sont corrects</li>
    </ul>
  </div>

  <button class="btn btn-warning btn-block mb-2" onclick="previewBulkSendNotes()">👁️ Aperçu avant envoi</button>
  <button class="btn btn-primary btn-block mb-2" onclick="confirmBulkSendNotes('${classId}')">📨 Envoyer les notes</button>
  <button class="btn btn-ghost btn-block" onclick="closeModal()">Annuler</button>`;

  openModal(html);
}

async function previewBulkSendNotes() {
  const period = document.getElementById('bulkSendPeriod')?.value;
  if (!period) { showToast('Sélectionnez un trimestre', 'error'); return; }

  const periodLabel = { T1: '1er Trimestre', T2: '2ème Trimestre', T3: '3ème Trimestre' };
  let html = `<h3>👁️ Aperçu de l'envoi</h3>
  <p style="margin-bottom:12px;"><b>Trimestre:</b> ${periodLabel[period]}</p>
  <p style="color:var(--text-secondary);font-size:.85rem;margin-bottom:16px;">Les élèves suivants recevront un email et une notification:</p>
  <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:12px;">`;

  const snap = await db.collection('users').where('role', '==', 'student').get();
  let count = 0;
  snap.forEach(doc => {
    const s = doc.data();
    if (s.parentEmail || s.email) {
      count++;
      html += `<div style="padding:8px;border-bottom:1px solid var(--border);">
        <div style="font-weight:600;">${s.fullName || (s.firstName + ' ' + s.lastName)}</div>
        <div style="font-size:.8rem;color:var(--text-secondary);">📧 ${s.parentEmail || s.email}</div>
      </div>`;
    }
  });

  html += `</div><p class="mt-3" style="color:var(--success);"><b>✅ ${count} élève(s) recevront les notes</b></p>
  <button class="btn btn-ghost mt-3 w-full" onclick="closeModal()">OK</button>`;

  openModal(html);
}

async function confirmBulkSendNotes(classId) {
  const period = document.getElementById('bulkSendPeriod')?.value;
  if (!period) { showToast('Sélectionnez un trimestre', 'error'); return; }

  const html = `<h3>⚠️ Confirmez l'envoi</h3>
  <p>Vous êtes sur le point d'envoyer les bulletins de la classe.</p>
  <p style="color:var(--danger);font-weight:700;margin-top:12px;">Cette action ne peut pas être annulée !</p>
  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="closeModal();doBulkSendNotes('${classId}', '${period}')">✅ Confirmer l'envoi</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;

  openModal(html);
}

async function doBulkSendNotes(classId, period) {
  try {
    showToast('⏳ Envoi des notes en cours...', 'info');
    
    // Charger tous les élèves de la classe
    const snap = await db.collection('users').where('classId', '==', classId).where('role', '==', 'student').get();
    let sentCount = 0;
    let errorCount = 0;

    for (const doc of snap.docs) {
      const student = doc.data();
      const resultDoc = await db.collection('studentResults').doc(`${doc.id}_${period}`).get();
      
      if (resultDoc.exists) {
        const result = resultDoc.data();
        const periodLabel = period === 'T1' ? '1er Trimestre' : period === 'T2' ? '2ème Trimestre' : '3ème Trimestre';
        
        // Envoyer notification in-app
        try {
          await db.collection('messages').add({
            recipientId: doc.id,
            senderId: State.user.uid,
            senderName: State.profile.schoolName || State.profile.fullName || 'École',
            schoolId: State.user.uid,
            type: 'school',
            title: `📄 Bulletin de notes – ${periodLabel}`,
            body: `Bonjour ${student.fullName || ''}, votre bulletin du ${periodLabel} est disponible. Connectez-vous pour le consulter.`,
            period,
            bulletinAvailable: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
          });
          sentCount++;
        } catch (e) {
          console.warn('Erreur notification:', e);
          errorCount++;
        }
      }
    }

    showToast(`✅ Notes envoyées ! ${sentCount} élève(s) notifiés.${errorCount > 0 ? ` (${errorCount} erreur(s))` : ''}`, 'success');
    closeModal();
  } catch (e) {
    console.error(e);
    showToast('Erreur d\'envoi', 'error');
  }
}

// ============================================================
// MISE À JOUR ROUTEUR – Enregistrer les nouvelles pages
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof pages !== 'undefined') {
      pages['school-teachers'] = renderTeachersManagement;
      pages['school-directors'] = renderDirectorsManagement;
    }
  }, 1000);
});

// ============================================================
// FONCTION MOT DE PASSE OUBLIÉ – Réinitialiser le mot de passe
// ============================================================

async function openForgotPasswordModal() {
  const html = `
  <h3>🔒 Récupérer votre compte</h3>
  <p style="color:var(--text-secondary);margin-bottom:16px;">Entrez votre email pour réinitialiser votre mot de passe.</p>
  
  <div class="form-group">
    <label>Email ou Identifiant *</label>
    <input class="form-input" id="forgotPasswordEmail" placeholder="student@neoclass.com ou ELEV-XXXXXX" />
  </div>

  <div class="form-group">
    <label>Type de compte *</label>
    <select class="form-input" id="forgotPasswordRole">
      <option value="">-- Sélectionner --</option>
      <option value="student">Élève</option>
      <option value="school">École</option>
      <option value="parent">Parent</option>
    </select>
  </div>

  <div class="flex gap-2 mt-3">
    <button class="btn btn-primary" onclick="processForgotPassword()">📧 Envoyer lien réinitialisation</button>
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
  </div>`;

  openModal(html);
}

async function processForgotPassword() {
  const email = document.getElementById('forgotPasswordEmail')?.value.trim();
  const role = document.getElementById('forgotPasswordRole')?.value;

  if (!email || !role) {
    showToast('Remplissez tous les champs', 'error');
    return;
  }

  try {
    showToast('⏳ Traitement en cours...', 'info');

    // Chercher l'utilisateur
    let userEmail = email;
    
    // Si c'est un identifiant étudiant (ELEV-XXXXXX), chercher dans Firestore
    if (email.startsWith('ELEV-') || email.startsWith('elev-')) {
      const snap = await db.collection('users')
        .where('studentId', '==', email.toUpperCase())
        .where('role', '==', 'student')
        .limit(1)
        .get();
      
      if (snap.empty) {
        showToast('Identifiant élève non trouvé', 'error');
        return;
      }
      
      userEmail = snap.docs[0].data().email;
    }

    // Envoyer email de réinitialisation
    await auth.sendPasswordResetEmail(userEmail);

    showToast(
      `✅ Email de réinitialisation envoyé à ${userEmail}!\n\n📧 Consultez votre boîte mail (et courrier indésirable).\n\n🔗 Cliquez sur le lien pour créer un nouveau mot de passe.`,
      'success'
    );

    closeModal();

  } catch (e) {
    console.error('Erreur réinitialisation:', e);
    let message = 'Erreur lors de la réinitialisation';
    
    if (e.code === 'auth/user-not-found') {
      message = 'Cet email ou identifiant n\'existe pas';
    } else if (e.code === 'auth/invalid-email') {
      message = 'Email invalide';
    } else if (e.code === 'auth/too-many-requests') {
      message = 'Trop de tentatives. Réessayez plus tard.';
    }
    
    showToast(message, 'error');
  }
}

// ============================================================
// PAGE RÉINITIALISATION MOT DE PASSE
// ============================================================

async function renderPasswordResetPage(app) {
  const urlParams = new URLSearchParams(window.location.search);
  const actionCode = urlParams.get('oobCode');
  const mode = urlParams.get('mode');

  if (mode !== 'resetPassword' || !actionCode) {
    // Afficher la page de demande de réinitialisation
    app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(135deg,var(--primary),var(--accent));">
      <div class="card" style="max-width:450px;width:100%;">
        <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:8px;">🔒 Réinitialiser le mot de passe</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">Entrez votre email pour recevoir un lien de réinitialisation.</p>

        <div class="form-group">
          <label>Email ou Identifiant</label>
          <input class="form-input" id="resetEmail" placeholder="student@neoclass.com ou ELEV-XXXXXX" />
        </div>

        <button class="btn btn-primary btn-block" onclick="sendPasswordResetEmail()">📧 Envoyer lien</button>
        
        <p style="text-align:center;margin-top:16px;color:var(--text-secondary);">
          <a href="index.html" style="color:var(--primary);text-decoration:none;font-weight:600;">← Retour à la connexion</a>
        </p>
      </div>
    </div>`;
    return;
  }

  // Vérifier le code et afficher le formulaire de nouveau mot de passe
  try {
    const email = await auth.verifyPasswordResetCode(actionCode);
    
    app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(135deg,var(--primary),var(--accent));">
      <div class="card" style="max-width:450px;width:100%;">
        <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:8px;">🆕 Nouveau mot de passe</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">Entrez votre nouveau mot de passe pour <b>${email}</b></p>

        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input class="form-input" id="newPassword" type="password" placeholder="Minimum 8 caractères" />
        </div>

        <div class="form-group">
          <label>Confirmez le mot de passe</label>
          <input class="form-input" id="confirmPassword" type="password" placeholder="Confirmez" />
        </div>

        <button class="btn btn-primary btn-block" onclick="confirmPasswordReset('${actionCode}', '${email}')">
          💾 Sauvegarder le nouveau mot de passe
        </button>
        
        <p style="text-align:center;margin-top:16px;color:var(--text-secondary);">
          <a href="index.html" style="color:var(--primary);text-decoration:none;font-weight:600;">← Retour à la connexion</a>
        </p>
      </div>
    </div>`;

  } catch (e) {
    app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(135deg,var(--primary),var(--accent));">
      <div class="card" style="max-width:450px;width:100%;text-align:center;">
        <div style="font-size:3rem;margin-bottom:16px;">❌</div>
        <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:8px;">Lien invalide ou expiré</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">Ce lien de réinitialisation n'est plus valide.</p>
        <button class="btn btn-primary btn-block" onclick="window.location.href='index.html'">← Retour à la connexion</button>
      </div>
    </div>`;
  }
}

async function sendPasswordResetEmail() {
  const email = document.getElementById('resetEmail')?.value.trim();
  
  if (!email) {
    showToast('Entrez votre email ou identifiant', 'error');
    return;
  }

  try {
    showToast('⏳ Envoi du lien...', 'info');

    // Si c'est un identifiant étudiant
    let resetEmail = email;
    if (email.startsWith('ELEV-') || email.startsWith('elev-')) {
      const snap = await db.collection('users')
        .where('studentId', '==', email.toUpperCase())
        .limit(1)
        .get();
      
      if (snap.empty) {
        showToast('Identifiant non trouvé', 'error');
        return;
      }
      
      resetEmail = snap.docs[0].data().email;
    }

    await auth.sendPasswordResetEmail(resetEmail);
    showToast(`✅ Lien envoyé à ${resetEmail}!`, 'success');

  } catch (e) {
    console.error(e);
    showToast('Erreur: ' + (e.message || 'Réessayez'), 'error');
  }
}

async function confirmPasswordReset(actionCode, email) {
  const password = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    showToast('Remplissez tous les champs', 'error');
    return;
  }

  if (password.length < 8) {
    showToast('Le mot de passe doit avoir au moins 8 caractères', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Les mots de passe ne correspondent pas', 'error');
    return;
  }

  try {
    showToast('⏳ Mise à jour du mot de passe...', 'info');
    
    await auth.confirmPasswordReset(actionCode, password);
    
    showToast('✅ Mot de passe réinitialisé avec succès!', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);

  } catch (e) {
    console.error(e);
    let message = 'Erreur lors de la réinitialisation';
    
    if (e.code === 'auth/weak-password') {
      message = 'Le mot de passe est trop faible';
    } else if (e.code === 'auth/invalid-action-code') {
      message = 'Lien expiré ou invalide';
    }
    
    showToast(message, 'error');
  }
}

// Enregistrer la page de réinitialisation
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof pages !== 'undefined') {
      pages['password-reset'] = renderPasswordResetPage;
    }
  }, 500);
});

console.log('✅ Module École v2.0 + Mot de passe oublié chargé !');
