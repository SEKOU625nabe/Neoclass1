// ============================================================
// PATCH COMPLET - Amélioration formulaires + affichage classes
// À insérer APRÈS neoclass-school-v2.js dans le HTML
// ============================================================

console.log('⚙️ Chargement patch améliorations...');

// ============================================================
// 1. AMÉLIORATION: Page Professeurs - Meilleur formulaire
// ============================================================

// Remplacer la fonction renderTeachersManagement si elle existe
const originalRenderTeachers = window.renderTeachersManagement || (() => {});

async function renderTeachersManagementEnhanced(app) {
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
          
          <form onsubmit="saveTeacherEnhanced(event)">
            <!-- Photo upload -->
            <div style="text-align:center;margin-bottom:24px;">
              <label style="display:block;margin-bottom:12px;font-weight:600;color:var(--text);">📷 Photo du professeur</label>
              <div id="teachPhotoPreviewEnhanced" 
                   style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#6358f5,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:3rem;color:#fff;overflow:hidden;border:4px solid var(--border);cursor:pointer;margin:0 auto;transition:all .3s ease;"
                   onclick="document.getElementById('teachPhotoEnhanced').click()"
                   onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 20px rgba(0,0,0,.2)'"
                   onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
                👨‍🏫
              </div>
              <input type="file" id="teachPhotoEnhanced" accept="image/*" style="display:none;" onchange="previewTeacherPhotoEnhanced(this)" />
              <small style="display:block;margin-top:8px;color:var(--text-secondary);">Clic pour changer</small>
            </div>

            <!-- Infos de base -->
            <div class="form-group">
              <label style="font-weight:600;">Nom complet *</label>
              <input class="form-input" id="teachNameEnhanced" placeholder="Jean Dupont" required style="padding:12px;border-radius:8px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Titre *</label>
              <select class="form-input" id="teachTitleEnhanced" required style="padding:12px;border-radius:8px;">
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
              <input class="form-input" type="email" id="teachEmailEnhanced" placeholder="prof@ecole.com" style="padding:12px;border-radius:8px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Téléphone</label>
              <input class="form-input" id="teachPhoneEnhanced" placeholder="+224 6XX XX XX XX" style="padding:12px;border-radius:8px;" />
            </div>

            <!-- Matière -->
            <div class="form-group">
              <label style="font-weight:600;">Matière(s) *</label>
              <input class="form-input" id="teachSubjectEnhanced" placeholder="Mathématiques, Français..." required style="padding:12px;border-radius:8px;" />
            </div>

            <!-- Classe -->
            <div class="form-group">
              <label style="font-weight:600;">Classe principale</label>
              <select class="form-input" id="teachClassEnhanced" style="padding:12px;border-radius:8px;">
                <option value="">-- Aucune --</option>
              </select>
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
            <input class="form-input" id="teachersSearchEnhanced" 
                   placeholder="🔍 Chercher par nom ou matière..." 
                   oninput="filterTeachersEnhanced(this.value)" 
                   style="padding:12px;border-radius:8px;" />
          </div>

          <!-- Liste -->
          <div id="teachersListEnhanced" style="max-height:600px;overflow-y:auto;">
            <p style="color:var(--text-secondary);text-align:center;padding:40px;">⏳ Chargement des professeurs...</p>
          </div>
        </div>
      </div>
    </main>
  </div>`;

  // Charger les données
  setTimeout(() => {
    loadTeachersClassesEnhanced();
    loadTeachersEnhanced();
  }, 300);
}

// Fonctions améliorées pour professeurs
let _teacherPhotoBase64Enhanced = null;

function previewTeacherPhotoEnhanced(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _teacherPhotoBase64Enhanced = e.target.result;
      const preview = document.getElementById('teachPhotoPreviewEnhanced');
      if (preview) {
        preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function loadTeachersClassesEnhanced() {
  try {
    const snap = await db.collection('classes').where('schoolId', '==', State.user.uid).get();
    const select = document.getElementById('teachClassEnhanced');
    if (!select) return;
    snap.forEach(doc => {
      const c = doc.data();
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${c.name} (${c.level})`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('Erreur classes:', e);
  }
}

async function saveTeacherEnhanced(e) {
  e.preventDefault();
  
  const name = document.getElementById('teachNameEnhanced')?.value.trim();
  const title = document.getElementById('teachTitleEnhanced')?.value;
  const email = document.getElementById('teachEmailEnhanced')?.value.trim() || '';
  const phone = document.getElementById('teachPhoneEnhanced')?.value.trim() || '';
  const subject = document.getElementById('teachSubjectEnhanced')?.value.trim() || '';
  const classId = document.getElementById('teachClassEnhanced')?.value || '';

  if (!name || !title || !subject) {
    showToast('❌ Remplissez: Nom, Titre, Matière', 'error');
    return;
  }

  try {
    showToast('⏳ Enregistrement...', 'info');
    
    await db.collection('teachers').add({
      schoolId: State.user.uid,
      name,
      title,
      email,
      phone,
      subjects: subject.split(',').map(s => s.trim()).filter(s => s),
      mainClassId: classId,
      photoURL: _teacherPhotoBase64Enhanced || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      dateAdded: new Date().toLocaleDateString('fr-FR')
    });

    showToast('✅ Professeur enregistré!', 'success');
    _teacherPhotoBase64Enhanced = null;
    document.querySelector('form')?.reset();
    document.getElementById('teachPhotoPreviewEnhanced').innerHTML = '👨‍🏫';
    loadTeachersEnhanced();

  } catch (e) {
    console.error(e);
    showToast('❌ Erreur: ' + e.message, 'error');
  }
}

let _allTeachersEnhanced = [];

async function loadTeachersEnhanced() {
  try {
    const snap = await db.collection('teachers').where('schoolId', '==', State.user.uid).orderBy('createdAt', 'desc').get();
    _allTeachersEnhanced = [];
    snap.forEach(doc => _allTeachersEnhanced.push({ id: doc.id, ...doc.data() }));
    
    // Mettre à jour le badge
    const badge = document.getElementById('teacherCount');
    if (badge) badge.textContent = _allTeachersEnhanced.length + ' prof' + (_allTeachersEnhanced.length > 1 ? 's' : '');
    
    renderTeachersListEnhanced(_allTeachersEnhanced);
  } catch (e) {
    console.error(e);
    const el = document.getElementById('teachersListEnhanced');
    if (el) el.innerHTML = '<p style="color:var(--danger);">❌ Erreur de chargement.</p>';
  }
}

function filterTeachersEnhanced(q) {
  const query = q.toLowerCase();
  const filtered = _allTeachersEnhanced.filter(t =>
    t.name.toLowerCase().includes(query) ||
    (t.title || '').toLowerCase().includes(query) ||
    (t.subjects || []).some(s => s.toLowerCase().includes(query)) ||
    (t.email || '').toLowerCase().includes(query)
  );
  renderTeachersListEnhanced(filtered);
}

function renderTeachersListEnhanced(teachers) {
  const el = document.getElementById('teachersListEnhanced');
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
                 onmouseenter="this.style.borderColor='var(--primary)';this.style.boxShadow='0 2px 8px rgba(0,0,0,.1)'"
                 onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      <div style="display:flex;gap:12px;align-items:center;">
        ${photo}
        <div style="flex:1;">
          <div style="font-weight:700;font-size:1.05rem;">${t.name}</div>
          <div style="font-size:.9rem;color:var(--text-secondary);">
            📚 ${(t.subjects || []).join(', ') || 'N/A'} 
            ${t.title ? `| <b>${t.title}</b>` : ''}
          </div>
          ${t.email ? `<div style="font-size:.85rem;color:var(--text-secondary);">📧 ${t.email}</div>` : ''}
          ${t.phone ? `<div style="font-size:.85rem;color:var(--text-secondary);">📞 ${t.phone}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteTeacherEnhanced('${t.id}')" 
                style="padding:6px 12px;font-size:.9rem;">🗑️</button>
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

async function deleteTeacherEnhanced(id) {
  if (!confirm('Supprimer ce professeur?')) return;
  try {
    await db.collection('teachers').doc(id).delete();
    showToast('✅ Professeur supprimé', 'success');
    loadTeachersEnhanced();
  } catch (e) {
    showToast('❌ Erreur', 'error');
  }
}

// ============================================================
// 2. AMÉLIORATION: Page Dirigeants - Meilleur formulaire
// ============================================================

async function renderDirectorsManagementEnhanced(app) {
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
        <h1 style="font-size:1.8rem;font-weight:800;">🎓 Gestion des Dirigeants</h1>
        <span class="badge" style="background:var(--accent);color:#fff;font-size:1rem;padding:8px 12px;" id="directorsCount">0 cadres</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-top:20px;">
        <!-- FORMULAIRE DIRIGEANT -->
        <div class="card" style="padding:24px;height:fit-content;position:sticky;top:20px;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:20px;border-bottom:3px solid var(--accent);padding-bottom:12px;">
            ➕ Ajouter un cadre
          </h3>

          <form onsubmit="saveDirectorEnhanced(event)">
            <!-- Photo -->
            <div style="text-align:center;margin-bottom:24px;">
              <label style="display:block;margin-bottom:12px;font-weight:600;">📷 Photo du cadre</label>
              <div id="dirPhotoPreviewEnhanced" 
                   style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:3rem;color:#fff;overflow:hidden;border:4px solid var(--border);cursor:pointer;margin:0 auto;transition:all .3s;"
                   onclick="document.getElementById('dirPhotoEnhanced').click()"
                   onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 20px rgba(0,0,0,.2)'"
                   onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
                👔
              </div>
              <input type="file" id="dirPhotoEnhanced" accept="image/*" style="display:none;" onchange="previewDirectorPhotoEnhanced(this)" />
              <small style="display:block;margin-top:8px;color:var(--text-secondary);">Clic pour changer</small>
            </div>

            <!-- Infos -->
            <div class="form-group">
              <label style="font-weight:600;">Nom complet *</label>
              <input class="form-input" id="dirNameEnhanced" placeholder="Nom du dirigeant" required style="padding:12px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Poste *</label>
              <select class="form-input" id="dirPositionEnhanced" required style="padding:12px;">
                <option value="">-- Sélectionner --</option>
                <option value="Directeur Général">Directeur Général</option>
                <option value="Directeur">Directeur</option>
                <option value="Sous-directeur">Sous-directeur</option>
                <option value="Chef de cycle">Chef de cycle</option>
                <option value="Coordonnateur pédagogique">Coordonnateur pédagogique</option>
                <option value="Surveillant général">Surveillant général</option>
                <option value="Gestionnaire">Gestionnaire</option>
                <option value="Autre cadre">Autre cadre</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Email</label>
              <input class="form-input" type="email" id="dirEmailEnhanced" placeholder="directeur@ecole.com" style="padding:12px;" />
            </div>

            <div class="form-group">
              <label style="font-weight:600;">Téléphone</label>
              <input class="form-input" id="dirPhoneEnhanced" placeholder="+224 6XX XX XX XX" style="padding:12px;" />
            </div>

            <button class="btn btn-accent btn-block" type="submit" 
                    style="padding:14px;font-weight:700;font-size:1rem;border-radius:8px;margin-top:20px;cursor:pointer;">
              ✅ Enregistrer le cadre
            </button>
          </form>
        </div>

        <!-- LISTE DIRIGEANTS -->
        <div class="card" style="padding:24px;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:20px;border-bottom:3px solid var(--accent);padding-bottom:12px;">
            👥 Cadres de l'établissement
          </h3>

          <div style="margin-bottom:20px;">
            <input class="form-input" id="directorsSearchEnhanced" 
                   placeholder="🔍 Chercher par nom ou poste..." 
                   oninput="filterDirectorsEnhanced(this.value)" 
                   style="padding:12px;" />
          </div>

          <div id="directorsListEnhanced" style="max-height:600px;overflow-y:auto;">
            <p style="color:var(--text-secondary);text-align:center;padding:40px;">⏳ Chargement...</p>
          </div>
        </div>
      </div>
    </main>
  </div>`;

  setTimeout(() => {
    loadDirectorsEnhanced();
  }, 300);
}

let _directorPhotoBase64Enhanced = null;

function previewDirectorPhotoEnhanced(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      _directorPhotoBase64Enhanced = e.target.result;
      const preview = document.getElementById('dirPhotoPreviewEnhanced');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveDirectorEnhanced(e) {
  e.preventDefault();
  const name = document.getElementById('dirNameEnhanced')?.value.trim();
  const position = document.getElementById('dirPositionEnhanced')?.value;
  const email = document.getElementById('dirEmailEnhanced')?.value.trim() || '';
  const phone = document.getElementById('dirPhoneEnhanced')?.value.trim() || '';

  if (!name || !position) {
    showToast('❌ Remplissez: Nom et Poste', 'error');
    return;
  }

  try {
    showToast('⏳ Enregistrement...', 'info');
    
    await db.collection('directors').add({
      schoolId: State.user.uid,
      name,
      position,
      email,
      phone,
      photoURL: _directorPhotoBase64Enhanced || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });

    showToast('✅ Cadre enregistré!', 'success');
    _directorPhotoBase64Enhanced = null;
    document.querySelector('form')?.reset();
    document.getElementById('dirPhotoPreviewEnhanced').innerHTML = '👔';
    loadDirectorsEnhanced();

  } catch (e) {
    console.error(e);
    showToast('❌ Erreur', 'error');
  }
}

let _allDirectorsEnhanced = [];

async function loadDirectorsEnhanced() {
  try {
    const snap = await db.collection('directors').where('schoolId', '==', State.user.uid).orderBy('createdAt', 'desc').get();
    _allDirectorsEnhanced = [];
    snap.forEach(doc => _allDirectorsEnhanced.push({ id: doc.id, ...doc.data() }));
    
    const badge = document.getElementById('directorsCount');
    if (badge) badge.textContent = _allDirectorsEnhanced.length + ' cadre' + (_allDirectorsEnhanced.length > 1 ? 's' : '');
    
    renderDirectorsListEnhanced(_allDirectorsEnhanced);
  } catch (e) {
    console.error(e);
  }
}

function filterDirectorsEnhanced(q) {
  const query = q.toLowerCase();
  const filtered = _allDirectorsEnhanced.filter(d =>
    d.name.toLowerCase().includes(query) ||
    (d.position || '').toLowerCase().includes(query)
  );
  renderDirectorsListEnhanced(filtered);
}

function renderDirectorsListEnhanced(directors) {
  const el = document.getElementById('directorsListEnhanced');
  if (!el) return;

  if (directors.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">
      <div style="font-size:2rem;margin-bottom:12px;">📭</div>
      <p>Aucun cadre trouvé</p>
    </div>`;
    return;
  }

  let html = '';
  directors.forEach(d => {
    const photo = d.photoURL
      ? `<img src="${d.photoURL}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--accent);" />`
      : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;border:2px solid var(--accent);">👔</div>`;

    html += `<div class="card" style="padding:16px;margin-bottom:12px;border:1px solid var(--border);cursor:pointer;transition:all .2s;"
                 onmouseenter="this.style.borderColor='var(--accent)';this.style.boxShadow='0 2px 8px rgba(0,0,0,.1)'"
                 onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      <div style="display:flex;gap:12px;align-items:center;">
        ${photo}
        <div style="flex:1;">
          <div style="font-weight:700;font-size:1.05rem;">${d.name}</div>
          <div style="font-size:.9rem;color:var(--text-secondary);">📍 ${d.position}</div>
          ${d.email ? `<div style="font-size:.85rem;color:var(--text-secondary);">📧 ${d.email}</div>` : ''}
          ${d.phone ? `<div style="font-size:.85rem;color:var(--text-secondary);">📞 ${d.phone}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteDirectorEnhanced('${d.id}')"
                style="padding:6px 12px;font-size:.9rem;">🗑️</button>
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

async function deleteDirectorEnhanced(id) {
  if (!confirm('Supprimer ce cadre?')) return;
  try {
    await db.collection('directors').doc(id).delete();
    showToast('✅ Cadre supprimé', 'success');
    loadDirectorsEnhanced();
  } catch (e) {
    showToast('❌ Erreur', 'error');
  }
}

// ============================================================
// 3. REMPLACER LES FONCTIONS DANS LE ROUTEUR
// ============================================================

setTimeout(() => {
  if (typeof pages !== 'undefined') {
    console.log('📝 Remplacement des pages améliorées...');
    pages['school-teachers'] = renderTeachersManagementEnhanced;
    pages['school-directors'] = renderDirectorsManagementEnhanced;
    console.log('✅ Pages améliorées chargées!');
  }
}, 1000);

console.log('✅ Patch améliorations chargé avec succès!');
