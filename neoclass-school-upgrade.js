// ============================================================
// 🏫 NEOCLASS — SCHOOL UPGRADE v2.0
// 
// COMMENT UTILISER CE FICHIER :
// ─────────────────────────────────────────────────────────────
// 1. Ouvre Neoclass3.html dans ton éditeur (VS Code, Notepad++, etc.)
// 2. Cherche (Ctrl+F) la fonction exacte à remplacer (ex: "function renderSchoolStudents")
// 3. Sélectionne TOUTE la fonction jusqu'à son accolade fermante }
// 4. Remplace-la par la version améliorée ci-dessous
// 5. Pour les NOUVELLES fonctions (renderSchoolSearch, etc.), colle-les
//    juste APRÈS la fonction renderSchoolStudents existante
// ─────────────────────────────────────────────────────────────
// RÉSUMÉ DES CHANGEMENTS :
//   [REMPLACE] renderSchoolStudents       → formulaire enrichi + photo + matricule + age + adresse
//   [REMPLACE] regSchoolStudent           → sauvegarde les nouveaux champs
//   [REMPLACE] loadSchoolStudents         → liste riche avec photo, recherche, profil
//   [NOUVEAU]  renderSchoolSearch         → page recherche rapide
//   [NOUVEAU]  showStudentProfile         → modal profil complet avec notes
//   [NOUVEAU]  renderSchoolPaymentsPlus   → paiements enrichis
// ============================================================


// ============================================================
// [REMPLACE] renderSchoolStudents — ligne ~20734 dans Neoclass3.html
// Remplace toute la fonction renderSchoolStudents(app){...}
// ============================================================
function renderSchoolStudents(app){
  if(!State.user||!isSchool()){navigate('dashboard');return;}
  const sl=getSidebarLinks('school');
  const sys=State.profile.system||'guinea';
  const data=eduData[sys];
  const allLevels=[...data.primary,...data.middle,...data.highschool.levels];

  app.innerHTML=`
  <div class="layout-dashboard">
    <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
    <main class="main-content animate-fade">
      <h1 style="font-size:1.6rem;font-weight:800;" class="mb-3">🎓 Gestion des Élèves</h1>

      <!-- ONGLETS -->
      <div style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:24px;">
        <button class="nc-tab active" id="tab-inscrire" onclick="switchSchoolTab('inscrire')">➕ Inscrire</button>
        <button class="nc-tab" id="tab-liste" onclick="switchSchoolTab('liste')">📋 Liste</button>
        <button class="nc-tab" id="tab-search" onclick="switchSchoolTab('search')">🔍 Recherche</button>
      </div>

      <!-- ONGLET : INSCRIRE -->
      <div id="school-tab-inscrire">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div class="card">
            <h3 class="mb-3">📝 Inscrire un nouvel élève</h3>

            <!-- Photo -->
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
              <div id="stuPhotoPreview" onclick="document.getElementById('stuPhotoInput').click()"
                style="width:80px;height:80px;border-radius:50%;border:2px dashed var(--border);
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                overflow:hidden;font-size:28px;flex-shrink:0;" title="Cliquer pour ajouter une photo">
                📷
              </div>
              <div>
                <input type="file" id="stuPhotoInput" accept="image/*" style="display:none"
                  onchange="previewStuPhoto(this)">
                <button class="btn btn-ghost btn-sm" onclick="document.getElementById('stuPhotoInput').click()">
                  📷 Choisir une photo
                </button>
                <p style="font-size:11px;color:var(--text-secondary);margin-top:4px;">
                  Photo de profil de l'élève (optionnel)
                </p>
              </div>
            </div>

            <form onsubmit="regSchoolStudent(event)">
              <!-- Nom & Prénom -->
              <div class="form-row">
                <div class="form-group">
                  <label>${t('lastName')} *</label>
                  <input class="form-input" id="stLn" placeholder="Nom de famille" required />
                </div>
                <div class="form-group">
                  <label>${t('firstName')} *</label>
                  <input class="form-input" id="stFn" placeholder="Prénom" required />
                </div>
              </div>

              <!-- Date naissance + Sexe -->
              <div class="form-row">
                <div class="form-group">
                  <label>Date de naissance</label>
                  <input class="form-input" type="date" id="stDOB" />
                </div>
                <div class="form-group">
                  <label>Sexe</label>
                  <select class="form-input" id="stSexe">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <!-- Classe + Matricule -->
              <div class="form-row">
                <div class="form-group">
                  <label>${t('className')} *</label>
                  <select class="form-input" id="stClass" required>
                    ${allLevels.map(l=>`<option>${l}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Matricule <span style="color:var(--text-secondary);font-size:11px;">(auto si vide)</span></label>
                  <input class="form-input" id="stMatricule" placeholder="Ex: 2025-0042" />
                </div>
              </div>

              <!-- Nationalité + Adresse -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nationalité</label>
                  <input class="form-input" id="stNat" placeholder="Ex: Guinéenne" />
                </div>
                <div class="form-group">
                  <label>Adresse / Quartier</label>
                  <input class="form-input" id="stAddr" placeholder="Quartier, commune..." />
                </div>
              </div>

              <!-- Parent & Téléphone -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nom du parent / tuteur</label>
                  <input class="form-input" id="stParent" placeholder="Nom complet" />
                </div>
                <div class="form-group">
                  <label>Téléphone parent</label>
                  <input class="form-input" id="stParentPh" placeholder="+224..." />
                </div>
              </div>

              <!-- Paiement -->
              <div style="background:rgba(255,150,0,0.06);border:1px solid rgba(255,150,0,0.2);
                border-radius:12px;padding:14px;margin-bottom:14px;">
                <div style="font-weight:700;margin-bottom:10px;color:var(--accent);">💰 Frais de scolarité</div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Montant total (GNF)</label>
                    <input class="form-input" type="number" id="stFeeTotal" placeholder="Ex: 500000" />
                  </div>
                  <div class="form-group">
                    <label>Montant payé</label>
                    <input class="form-input" type="number" id="stFeePaid" placeholder="Ex: 250000" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Mode de paiement</label>
                    <select class="form-input" id="stPayMode">
                      <option>Espèces</option>
                      <option>Orange Money</option>
                      <option>MTN MoMo</option>
                      <option>Wave</option>
                      <option>Chèque</option>
                      <option>Virement</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Date de paiement</label>
                    <input class="form-input" type="date" id="stPayDate" />
                  </div>
                </div>
              </div>

              <button class="btn btn-primary btn-block" type="submit">✅ Inscrire l'élève</button>
            </form>
            <button class="btn btn-ghost btn-sm mt-2 w-full" onclick="darxAsk('Aide pour inscrire un élève')">🤖 Aide DARX</button>
          </div>

          <!-- LISTE RAPIDE -->
          <div class="card">
            <h3 class="mb-2">👥 Dernières inscriptions</h3>
            <div id="scStudList"><p style="color:var(--text-secondary);">Chargement...</p></div>
          </div>
        </div>
      </div>

      <!-- ONGLET : LISTE COMPLÈTE -->
      <div id="school-tab-liste" style="display:none;">
        <div class="card mb-3" style="padding:14px;">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);
              border-radius:10px;padding:8px 14px;flex:1;min-width:200px;">
              🔍 <input type="text" id="listSearchQ" placeholder="Rechercher par nom, matricule..."
                oninput="filterSchoolStudentList()"
                style="border:none;background:none;outline:none;width:100%;font-size:14px;">
            </div>
            <select class="form-input" id="listFilterClass" onchange="filterSchoolStudentList()"
              style="width:auto;">
              <option value="">Toutes les classes</option>
              ${allLevels.map(l=>`<option value="${l}">${l}</option>`).join('')}
            </select>
            <select class="form-input" id="listFilterPay" onchange="filterSchoolStudentList()"
              style="width:auto;">
              <option value="">Tous paiements</option>
              <option value="paye">✅ Payé</option>
              <option value="partiel">⚠️ Partiel</option>
              <option value="impaye">❌ Impayé</option>
            </select>
          </div>
        </div>
        <div class="card">
          <div id="scStudListFull"><p style="color:var(--text-secondary);text-align:center;padding:32px;">
            Chargement...</p></div>
        </div>
      </div>

      <!-- ONGLET : RECHERCHE RAPIDE -->
      <div id="school-tab-search" style="display:none;">
        <div class="card mb-3">
          <h3 class="mb-3">🔍 Recherche rapide d'élève</h3>
          <div style="display:flex;align-items:center;gap:8px;background:var(--bg);border:2px solid var(--border);
            border-radius:12px;padding:12px 16px;">
            🔍 <input type="text" id="quickSearchQ" placeholder="Tapez un nom, prénom, matricule ou classe..."
              oninput="quickSearchStudents()"
              style="border:none;background:none;outline:none;width:100%;font-size:15px;">
          </div>
        </div>
        <div id="quickSearchResults"></div>
      </div>

    </main>
  </div>`;

  // Ajouter les styles des onglets si pas encore présents
  if(!document.getElementById('ncTabStyles')){
    const style = document.createElement('style');
    style.id = 'ncTabStyles';
    style.textContent = `
      .nc-tab {
        padding: 10px 22px; border: none; background: none; cursor: pointer;
        font-size: 14px; font-weight: 600; color: var(--text-secondary);
        border-bottom: 3px solid transparent; transition: all 0.2s;
      }
      .nc-tab:hover { color: var(--text); }
      .nc-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
      .stu-card {
        display: flex; align-items: center; gap: 14px; padding: 12px 14px;
        border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px;
        cursor: pointer; transition: all 0.2s;
      }
      .stu-card:hover { border-color: var(--primary); background: rgba(88,204,2,0.03); }
      .stu-avatar {
        width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg, var(--primary), var(--info));
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; font-weight: 700; color: #fff; overflow: hidden;
      }
      .stu-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .pay-badge {
        display: inline-block; padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 600;
      }
      .pay-ok { background: rgba(88,204,2,0.12); color: #46a302; }
      .pay-partial { background: rgba(255,150,0,0.12); color: #d97706; }
      .pay-no { background: rgba(255,75,75,0.12); color: #dc2626; }
    `;
    document.head.appendChild(style);
  }

  // Init date paiement
  const today = new Date().toISOString().split('T')[0];
  if(document.getElementById('stPayDate')) document.getElementById('stPayDate').value = today;

  loadSchoolStudents();
  window._schoolAllStudents = [];
}

// ============================================================
// Switch d'onglet
// ============================================================
function switchSchoolTab(tab) {
  ['inscrire','liste','search'].forEach(t => {
    document.getElementById('school-tab-' + t).style.display = t === tab ? '' : 'none';
    const btn = document.getElementById('tab-' + t);
    if(btn) { btn.classList.toggle('active', t === tab); }
  });
  if(tab === 'liste') loadSchoolStudentsFull();
  if(tab === 'search') { const q = document.getElementById('quickSearchQ'); if(q) q.focus(); }
}

// ============================================================
// Preview photo élève
// ============================================================
function previewStuPhoto(input) {
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('stuPhotoPreview');
    if(prev) {
      prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      prev.dataset.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

// ============================================================
// [REMPLACE] regSchoolStudent — ligne ~20757 dans Neoclass3.html
// Remplace toute la fonction regSchoolStudent(e){...}
// ============================================================
async function regSchoolStudent(e){
  e.preventDefault();
  const ln = document.getElementById('stLn')?.value.trim() || '';
  const fn = document.getElementById('stFn')?.value.trim() || '';
  const cls = document.getElementById('stClass')?.value || '';
  if(!ln || !fn || !cls){ showToast('Nom, prénom et classe requis !','error'); return; }

  const schoolUid = State.user.uid;
  const schoolProfile = {...State.profile};

  // Matricule auto
  const matriculeInput = document.getElementById('stMatricule')?.value.trim();
  const matricule = matriculeInput || 'ELEV-' + generateId(6);
  const stuId = matricule.toUpperCase();
  const stuPwd = generatePwd(8);
  const stuEmail = stuId.replace(/[^a-zA-Z0-9]/g,'').toLowerCase() + '@neoclass.com';

  // Photo base64
  const photoPrev = document.getElementById('stuPhotoPreview');
  const photoBase64 = photoPrev?.dataset?.src || '';

  // Champs enrichis
  const dob = document.getElementById('stDOB')?.value || '';
  const sexe = document.getElementById('stSexe')?.value || 'M';
  const nationalite = document.getElementById('stNat')?.value.trim() || '';
  const adresse = document.getElementById('stAddr')?.value.trim() || '';
  const parentName = document.getElementById('stParent')?.value.trim() || '';
  const parentPhone = document.getElementById('stParentPh')?.value.trim() || '';
  const feeTotal = parseFloat(document.getElementById('stFeeTotal')?.value) || 0;
  const feePaid = parseFloat(document.getElementById('stFeePaid')?.value) || 0;
  const payMode = document.getElementById('stPayMode')?.value || 'Espèces';
  const payDate = document.getElementById('stPayDate')?.value || '';

  // Calcul âge
  let age = null;
  if(dob) {
    const diff = Date.now() - new Date(dob).getTime();
    age = Math.floor(diff / (1000*60*60*24*365.25));
  }

  try {
    // 1. Créer l'utilisateur Firebase Auth
    const cred = await auth.createUserWithEmailAndPassword(stuEmail, stuPwd);
    const studentUid = cred.user.uid;

    // 2. Données complètes de l'élève
    const studentData = {
      uid: studentUid,
      studentId: stuId,
      email: stuEmail,
      fullName: fn + ' ' + ln,
      lastName: ln,
      firstName: fn,
      className: cls,
      // Nouveaux champs
      dateOfBirth: dob,
      age: age,
      sexe: sexe,
      nationalite: nationalite,
      adresse: adresse,
      matricule: stuId,
      photoURL: photoBase64,
      parentName: parentName,
      parentPhone: parentPhone,
      feeTotal: feeTotal,
      feePaid: feePaid,
      feeReste: feeTotal - feePaid,
      payMode: payMode,
      payDate: payDate,
      payHistory: feePaid > 0 ? [{ amount: feePaid, mode: payMode, date: payDate, note: 'Paiement initial' }] : [],
      // Champs système
      schoolId: schoolUid,
      schoolName: schoolProfile.schoolName || schoolProfile.fullName || '',
      schoolLogo: schoolProfile.schoolLogo || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      inscritLe: new Date().toLocaleDateString('fr-FR'),
      role: 'student',
      isOnline: false,
      isBanned: false,
      videoWatched: false,
      level: cls,
      system: schoolProfile.system || 'guinea',
      totalXP: 0,
      nabecoins: 50,
      streak: 0
    };

    // 3. Sauvegarder dans users
    await db.collection('users').doc(studentUid).set(studentData);

    // 4. Sauvegarder dans schools/students
    await db.collection('schools').doc(schoolUid).collection('students').add(studentData);

    // 5. Déconnecter l'élève nouvellement créé
    await auth.signOut();

    // 6. Modal de succès
    const payStatus = feePaid >= feeTotal && feeTotal > 0 ? '✅ Payé' :
                      feePaid > 0 ? '⚠️ Partiel' : '❌ Impayé';
    const initials = (fn[0]||'')+(ln[0]||'');

    openModal(`<div class="text-center">
      <div style="font-size:3rem;margin-bottom:8px;">🎓</div>
      <h3>Élève inscrit avec succès !</h3>
      <div style="display:flex;justify-content:center;margin:12px 0;">
        <div style="width:60px;height:60px;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,var(--primary),var(--info));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;">
          ${photoBase64 ? `<img src="${photoBase64}" style="width:100%;height:100%;object-fit:cover;">` : initials}
        </div>
      </div>
      <div class="card mt-2" style="background:rgba(16,185,129,.06);text-align:left;">
        <p><strong>${fn} ${ln}</strong> — ${cls}</p>
        <p style="margin-top:6px;">📧 <code style="color:var(--primary)">${stuEmail}</code></p>
        <p style="margin-top:6px;">🔑 Matricule: <code style="color:var(--primary)">${stuId}</code></p>
        <p style="margin-top:6px;">🔒 Mot de passe: <code style="color:var(--accent)">${stuPwd}</code></p>
        <p style="margin-top:6px;">💰 Paiement: <strong>${payStatus}</strong>
          ${feeTotal > 0 ? ` (${feePaid.toLocaleString('fr-FR')} / ${feeTotal.toLocaleString('fr-FR')} GNF)` : ''}
        </p>
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:10px;">
        ⚠️ Notez ces informations, elles ne s'afficheront plus !
      </p>
      <button class="btn btn-primary mt-3 w-full" onclick="closeModal();window.location.reload();">
        OK — Continuer
      </button>
    </div>`);

  } catch(err) {
    console.error('Erreur inscription:', err);
    showToast('Erreur : ' + (err.message || err), 'error');
  }
}

// ============================================================
// [REMPLACE] loadSchoolStudents — version enrichie (onglet Inscrire)
// ============================================================
async function loadSchoolStudents(){
  try{
    const snap = await db.collection('schools').doc(State.user.uid)
      .collection('students').orderBy('createdAt','desc').limit(10).get();
    const el = document.getElementById('scStudList');
    if(!el) return;
    if(snap.empty){ el.innerHTML='<p style="color:var(--text-secondary);text-align:center;padding:24px;">Aucun élève inscrit encore.</p>'; return; }
    let html = '';
    snap.forEach(doc => {
      const s = doc.data();
      const initials = ((s.firstName||'')[0]||'') + ((s.lastName||'')[0]||'');
      const reste = (s.feeTotal||0) - (s.feePaid||0);
      const payBadge = reste<=0 && s.feeTotal>0 ? '<span class="pay-badge pay-ok">Payé</span>' :
                       s.feePaid>0 ? '<span class="pay-badge pay-partial">Partiel</span>' :
                       s.feeTotal>0 ? '<span class="pay-badge pay-no">Impayé</span>' : '';
      html += `<div class="stu-card" onclick="showStudentProfile(${JSON.stringify(s).replace(/"/g,'&quot;')})">
        <div class="stu-avatar">
          ${s.photoURL ? `<img src="${s.photoURL}">` : initials}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.firstName} ${s.lastName}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${s.className} · ${s.matricule||s.studentId||''}</div>
        </div>
        ${payBadge}
      </div>`;
    });
    el.innerHTML = html;
  } catch(err) {
    const el = document.getElementById('scStudList');
    if(el) el.innerHTML = '<p style="color:var(--danger);">Erreur de chargement.</p>';
  }
}

// ============================================================
// [NOUVEAU] loadSchoolStudentsFull — onglet Liste complète
// ============================================================
async function loadSchoolStudentsFull(){
  const el = document.getElementById('scStudListFull');
  if(!el) return;
  try {
    const snap = await db.collection('schools').doc(State.user.uid)
      .collection('students').orderBy('createdAt','desc').get();
    window._schoolAllStudents = [];
    snap.forEach(doc => { window._schoolAllStudents.push(doc.data()); });
    renderStudentListFull(window._schoolAllStudents);
  } catch(err) {
    el.innerHTML = '<p style="color:var(--danger);text-align:center;padding:24px;">Erreur de chargement.</p>';
  }
}

function renderStudentListFull(students) {
  const el = document.getElementById('scStudListFull');
  if(!el) return;
  if(!students.length){
    el.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:32px;">Aucun élève trouvé.</p>';
    return;
  }
  let html = `<div style="overflow-x:auto;">
  <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
    <thead>
      <tr style="border-bottom:2px solid var(--border);">
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Élève</th>
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Matricule</th>
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Classe</th>
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Âge</th>
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Paiement</th>
        <th style="padding:10px 12px;text-align:left;color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;">Actions</th>
      </tr>
    </thead>
    <tbody>`;

  students.forEach(s => {
    const initials = ((s.firstName||'')[0]||'') + ((s.lastName||'')[0]||'');
    const age = s.dateOfBirth ? Math.floor((Date.now()-new Date(s.dateOfBirth))/(1000*60*60*24*365.25))+'ans' : '—';
    const reste = (s.feeTotal||0) - (s.feePaid||0);
    const payBadge = reste<=0 && s.feeTotal>0 ? '<span class="pay-badge pay-ok">✅ Payé</span>' :
                     s.feePaid>0 ? '<span class="pay-badge pay-partial">⚠️ Partiel</span>' :
                     s.feeTotal>0 ? '<span class="pay-badge pay-no">❌ Impayé</span>' : '—';
    const sJson = JSON.stringify(s).replace(/"/g,'&quot;');
    html += `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''">
      <td style="padding:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="stu-avatar" style="width:34px;height:34px;font-size:13px;">
            ${s.photoURL ? `<img src="${s.photoURL}">` : initials}
          </div>
          <div>
            <div style="font-weight:700;">${s.firstName} ${s.lastName}</div>
            <div style="font-size:11px;color:var(--text-secondary);">${s.inscritLe||''}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px;"><code style="font-size:11px;color:var(--info)">${s.matricule||s.studentId||'—'}</code></td>
      <td style="padding:12px;"><span style="background:rgba(28,176,246,0.1);color:var(--info);padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${s.className||'—'}</span></td>
      <td style="padding:12px;">${age}</td>
      <td style="padding:12px;">${payBadge}</td>
      <td style="padding:12px;">
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="showStudentProfile('${sJson}')" title="Voir profil">👁</button>
          <button class="btn btn-ghost btn-sm" onclick="openPayStudentModal('${sJson}')" title="Enregistrer paiement">💰</button>
        </div>
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function filterSchoolStudentList() {
  const q = (document.getElementById('listSearchQ')?.value||'').toLowerCase();
  const cls = document.getElementById('listFilterClass')?.value||'';
  const pay = document.getElementById('listFilterPay')?.value||'';
  const all = window._schoolAllStudents || [];
  const filtered = all.filter(s => {
    const name = `${s.firstName} ${s.lastName} ${s.matricule||s.studentId}`.toLowerCase();
    const matchQ = !q || name.includes(q);
    const matchCls = !cls || s.className === cls;
    const reste = (s.feeTotal||0) - (s.feePaid||0);
    const matchPay = !pay ||
      (pay==='paye' && reste<=0 && s.feeTotal>0) ||
      (pay==='partiel' && s.feePaid>0 && reste>0) ||
      (pay==='impaye' && s.feePaid<=0 && s.feeTotal>0);
    return matchQ && matchCls && matchPay;
  });
  renderStudentListFull(filtered);
}

// ============================================================
// [NOUVEAU] quickSearchStudents — Recherche rapide
// ============================================================
async function quickSearchStudents() {
  const q = (document.getElementById('quickSearchQ')?.value||'').trim().toLowerCase();
  const container = document.getElementById('quickSearchResults');
  if(!container) return;
  if(!q){ container.innerHTML=''; return; }

  // Utiliser le cache si dispo
  let all = window._schoolAllStudents || [];
  if(!all.length) {
    try {
      const snap = await db.collection('schools').doc(State.user.uid).collection('students').get();
      all = [];
      snap.forEach(d => all.push(d.data()));
      window._schoolAllStudents = all;
    } catch(err) { container.innerHTML='<p style="color:var(--danger);">Erreur.</p>'; return; }
  }

  const found = all.filter(s =>
    `${s.firstName} ${s.lastName} ${s.matricule||s.studentId} ${s.className} ${s.parentName||''}`.toLowerCase().includes(q)
  );

  if(!found.length){
    container.innerHTML = `<div class="card" style="text-align:center;padding:32px;color:var(--text-secondary);">
      🔍 Aucun élève trouvé pour "<strong>${q}</strong>"
    </div>`;
    return;
  }

  let html = `<p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">${found.length} résultat(s)</p>`;
  found.forEach(s => {
    const initials = ((s.firstName||'')[0]||'') + ((s.lastName||'')[0]||'');
    const age = s.dateOfBirth ? Math.floor((Date.now()-new Date(s.dateOfBirth))/(1000*60*60*24*365.25))+'ans' : '';
    const reste = (s.feeTotal||0) - (s.feePaid||0);
    const payBadge = reste<=0 && s.feeTotal>0 ? '<span class="pay-badge pay-ok">✅ Payé</span>' :
                     s.feePaid>0 ? '<span class="pay-badge pay-partial">⚠️ Partiel</span>' :
                     s.feeTotal>0 ? '<span class="pay-badge pay-no">❌ Impayé</span>' : '';
    const sJson = JSON.stringify(s).replace(/"/g,'&quot;');

    // Récupérer les notes si dispo
    html += `<div class="stu-card" onclick="showStudentProfile('${sJson}')">
      <div class="stu-avatar" style="width:52px;height:52px;font-size:18px;">
        ${s.photoURL ? `<img src="${s.photoURL}">` : initials}
      </div>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:15px;">${s.firstName} ${s.lastName}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">
          ${s.className} · <code style="color:var(--info)">${s.matricule||s.studentId||'—'}</code>
          ${age ? ` · ${age}` : ''}
        </div>
        ${s.parentName ? `<div style="font-size:12px;color:var(--text-secondary);">👨‍👩‍👧 ${s.parentName} ${s.parentPhone?'· '+s.parentPhone:''}</div>` : ''}
      </div>
      <div style="text-align:right;">${payBadge}</div>
    </div>`;
  });
  container.innerHTML = html;
}

// ============================================================
// [NOUVEAU] showStudentProfile — Modal profil complet
// ============================================================
async function showStudentProfile(sData) {
  // Accepte objet ou string JSON
  const s = typeof sData === 'string' ? JSON.parse(sData.replace(/&quot;/g,'"')) : sData;
  const initials = ((s.firstName||'')[0]||'') + ((s.lastName||'')[0]||'');
  const age = s.dateOfBirth ? Math.floor((Date.now()-new Date(s.dateOfBirth))/(1000*60*60*24*365.25)) : null;
  const reste = (s.feeTotal||0) - (s.feePaid||0);
  const payStatusColor = reste<=0&&s.feeTotal>0?'#46a302': s.feePaid>0?'#d97706':'#dc2626';
  const payStatusTxt = reste<=0&&s.feeTotal>0?'✅ Payé': s.feePaid>0?'⚠️ Partiel':'❌ Impayé';
  const fmtNum = n => (n||0).toLocaleString('fr-FR');

  // Récupérer les notes de l'élève depuis Firestore
  let notesHTML = '<p style="color:var(--text-secondary);font-size:13px;">Aucune note enregistrée.</p>';
  try {
    if(s.uid) {
      const notesSnap = await db.collection('schools').doc(State.user.uid)
        .collection('grades').where('studentId','==',s.uid).get();
      if(!notesSnap.empty) {
        notesHTML = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">';
        notesHTML += '<tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:6px;">Matière</th><th style="text-align:center;padding:6px;">Note</th><th style="text-align:center;padding:6px;">Coeff</th><th style="text-align:center;padding:6px;">Période</th></tr>';
        notesSnap.forEach(d => {
          const g = d.data();
          const color = (g.note||0) >= (g.passingGrade||10) ? '#46a302' : '#dc2626';
          notesHTML += `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
            <td style="padding:8px;">${g.subject||'—'}</td>
            <td style="padding:8px;text-align:center;font-weight:700;color:${color}">${g.note||'—'}/20</td>
            <td style="padding:8px;text-align:center;">${g.coefficient||1}</td>
            <td style="padding:8px;text-align:center;font-size:11px;color:var(--text-secondary)">${g.period||'—'}</td>
          </tr>`;
        });
        notesHTML += '</table></div>';
      }
    }
  } catch(err) { console.warn('Notes fetch error:', err); }

  const modalContent = `
  <div style="padding:4px;">
    <!-- En-tête profil -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
      <div class="stu-avatar" style="width:72px;height:72px;font-size:26px;flex-shrink:0;">
        ${s.photoURL ? `<img src="${s.photoURL}">` : initials}
      </div>
      <div>
        <h2 style="margin:0;font-size:1.3rem;">${s.firstName} ${s.lastName}</h2>
        <div style="color:var(--text-secondary);font-size:13px;margin-top:3px;">
          ${s.className} ·
          <code style="color:var(--info)">${s.matricule||s.studentId||'—'}</code>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">
          Inscrit le ${s.inscritLe||'—'}
        </div>
      </div>
    </div>

    <!-- Infos personnelles -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:16px;">
      <div><span style="color:var(--text-secondary)">Date de naissance:</span><br><strong>${s.dateOfBirth||'—'}</strong></div>
      <div><span style="color:var(--text-secondary)">Âge:</span><br><strong>${age ? age+' ans' : '—'}</strong></div>
      <div><span style="color:var(--text-secondary)">Sexe:</span><br><strong>${s.sexe==='F'?'Féminin':'Masculin'}</strong></div>
      <div><span style="color:var(--text-secondary)">Nationalité:</span><br><strong>${s.nationalite||'—'}</strong></div>
      <div><span style="color:var(--text-secondary)">Adresse:</span><br><strong>${s.adresse||'—'}</strong></div>
      <div><span style="color:var(--text-secondary)">Email:</span><br><strong style="font-size:11px;">${s.email||'—'}</strong></div>
    </div>

    <!-- Parent -->
    ${s.parentName||s.parentPhone ? `
    <div style="background:rgba(28,176,246,0.06);border:1px solid rgba(28,176,246,0.15);border-radius:10px;padding:12px;margin-bottom:14px;font-size:13px;">
      <div style="font-weight:700;margin-bottom:6px;color:var(--info)">👨‍👩‍👧 Parent / Tuteur</div>
      <div>${s.parentName||'—'} ${s.parentPhone ? '· 📞 '+s.parentPhone : ''}</div>
    </div>` : ''}

    <!-- Paiement -->
    <div style="background:rgba(255,150,0,0.06);border:1px solid rgba(255,150,0,0.2);border-radius:10px;padding:12px;margin-bottom:14px;font-size:13px;">
      <div style="font-weight:700;margin-bottom:8px;color:var(--accent)">💰 Scolarité</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;">
        <div><div style="font-size:11px;color:var(--text-secondary)">Total</div><div style="font-weight:700;">${fmtNum(s.feeTotal)} GNF</div></div>
        <div><div style="font-size:11px;color:var(--text-secondary)">Payé</div><div style="font-weight:700;color:#46a302">${fmtNum(s.feePaid)} GNF</div></div>
        <div><div style="font-size:11px;color:var(--text-secondary)">Reste</div><div style="font-weight:700;color:${payStatusColor}">${fmtNum(reste)} GNF</div></div>
      </div>
      <div style="margin-top:8px;"><strong style="color:${payStatusColor}">${payStatusTxt}</strong>
        ${s.payMode ? ` · ${s.payMode}` : ''}
        ${s.payDate ? ` · ${s.payDate}` : ''}
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div style="font-weight:700;margin-bottom:10px;font-size:14px;">📝 Notes & Évaluations</div>
      ${notesHTML}
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="closeModal();navigate('school-bulletins')">
        📄 Voir bulletin
      </button>
      <button class="btn btn-accent" onclick="closeModal();openPayStudentModal('${JSON.stringify(s).replace(/"/g,'&quot;')}')">
        💰 Enregistrer paiement
      </button>
    </div>
  </div>`;

  openModal(modalContent);
}

// ============================================================
// [NOUVEAU] openPayStudentModal — Enregistrer un paiement
// ============================================================
function openPayStudentModal(sData) {
  const s = typeof sData === 'string' ? JSON.parse(sData.replace(/&quot;/g,'"')) : sData;
  const reste = (s.feeTotal||0) - (s.feePaid||0);
  const today = new Date().toISOString().split('T')[0];

  openModal(`
  <div>
    <h3 style="margin-bottom:16px;">💰 Paiement — ${s.firstName} ${s.lastName}</h3>
    <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">
      Reste à payer : <strong style="color:var(--accent)">${reste.toLocaleString('fr-FR')} GNF</strong>
    </p>
    <div class="form-group mb-3">
      <label>Montant payé (GNF)</label>
      <input class="form-input" type="number" id="payModalAmount" placeholder="Ex: 100000" />
    </div>
    <div class="form-group mb-3">
      <label>Mode de paiement</label>
      <select class="form-input" id="payModalMode">
        <option>Espèces</option>
        <option>Orange Money</option>
        <option>MTN MoMo</option>
        <option>Wave</option>
        <option>Chèque</option>
      </select>
    </div>
    <div class="form-group mb-4">
      <label>Date</label>
      <input class="form-input" type="date" id="payModalDate" value="${today}" />
    </div>
    <button class="btn btn-primary btn-block" onclick="saveStudentPayment('${JSON.stringify(s).replace(/"/g,'&quot;')}')">
      ✅ Enregistrer
    </button>
  </div>`);
}

async function saveStudentPayment(sData) {
  const s = typeof sData === 'string' ? JSON.parse(sData.replace(/&quot;/g,'"')) : sData;
  const amount = parseFloat(document.getElementById('payModalAmount')?.value)||0;
  if(!amount){ showToast('Entrez un montant','error'); return; }
  const mode = document.getElementById('payModalMode')?.value||'Espèces';
  const date = document.getElementById('payModalDate')?.value||'';
  try {
    if(!s.uid) throw new Error('ID élève manquant');
    const newPaid = (s.feePaid||0) + amount;
    const newReste = (s.feeTotal||0) - newPaid;
    // Mettre à jour dans users
    await db.collection('users').doc(s.uid).update({
      feePaid: newPaid,
      feeReste: newReste,
      payHistory: firebase.firestore.FieldValue.arrayUnion({
        amount, mode, date, note: 'Paiement enregistré'
      })
    });
    // Mettre à jour dans schools/students
    const stuSnap = await db.collection('schools').doc(State.user.uid)
      .collection('students').where('uid','==',s.uid).limit(1).get();
    if(!stuSnap.empty){
      await stuSnap.docs[0].ref.update({
        feePaid: newPaid, feeReste: newReste,
        payHistory: firebase.firestore.FieldValue.arrayUnion({ amount, mode, date })
      });
    }
    closeModal();
    showToast(`${amount.toLocaleString('fr-FR')} GNF enregistré ✅`, 'success');
    // Refresh
    if(window._schoolAllStudents){
      const idx = window._schoolAllStudents.findIndex(x=>x.uid===s.uid);
      if(idx>-1){ window._schoolAllStudents[idx].feePaid=newPaid; window._schoolAllStudents[idx].feeReste=newReste; }
    }
    loadSchoolStudents();
  } catch(err) {
    showToast('Erreur : '+(err.message||err),'error');
  }
}
// ============================================================
// FIN DU FICHIER neoclass-school-upgrade.js
// ============================================================
