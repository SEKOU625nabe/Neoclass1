/* ============================================================
   Neoclass — noyau de l'application
   Firebase, état, utilitaires, icônes, composants, navigation.
   Tous les modules s'enregistrent sur l'objet global NC.
   ============================================================ */
(function () {
  'use strict';

  const NC = (window.NC = {});
  NC.version = '1.0.0';

  // ---------- Firebase (même projet que l'ancienne version) ----------
  NC.firebaseConfig = {
    apiKey: 'AIzaSyDgng4aei5klroWYW-b5CUUPs3CjQwpje8',
    authDomain: 'neoclass-73b86.firebaseapp.com',
    projectId: 'neoclass-73b86',
    storageBucket: 'neoclass-73b86.firebasestorage.app',
    messagingSenderId: '929829476921',
    appId: '1:929829476921:web:e1339769ec968886ae8be8'
  };
  firebase.initializeApp(NC.firebaseConfig);
  NC.auth = firebase.auth();
  NC.db = firebase.firestore();
  NC.now = () => firebase.firestore.FieldValue.serverTimestamp();

  NC.state = { user: null, profile: null, unread: 0 };

  // ---------- Rôles ----------
  // Les rôles stockés en base restent ceux de l'ancienne version.
  NC.roleGroup = function (role) {
    if (role === 'student' || role === 'indep_student') return 'student';
    if (role === 'teacher' || role === 'indep_teacher' || role === 'school_teacher') return 'teacher';
    if (role === 'school') return 'school';
    if (role === 'parent') return 'parent';
    if (role === 'admin' || role === 'superadmin') return 'admin';
    return 'student';
  };
  NC.roleLabel = function (role) {
    return {
      student: 'Élève', indep_student: 'Élève', teacher: 'Enseignant', indep_teacher: 'Enseignant',
      school_teacher: 'Enseignant', school: 'École', parent: 'Parent', admin: 'Administrateur', superadmin: 'Administrateur'
    }[role] || 'Utilisateur';
  };
  NC.group = () => NC.roleGroup(NC.state.profile && NC.state.profile.role);
  NC.uid = () => NC.state.user && NC.state.user.uid;

  // ---------- Utilitaires ----------
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  NC.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  NC.$ = (sel, root) => (root || document).querySelector(sel);
  NC.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  NC.firstName = (p) => String((p && (p.firstName || p.fullName || p.name || p.schoolName)) || '').trim().split(/\s+/)[0] || '';
  NC.displayName = (p) => (p && (p.fullName || p.name || p.schoolName || [p.firstName, p.lastName].filter(Boolean).join(' '))) || 'Utilisateur';
  NC.initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

  NC.toDate = (ts) => {
    if (!ts) return null;
    if (ts.toDate) return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    const d = new Date(ts);
    return isNaN(d) ? null : d;
  };
  NC.fmtDate = (ts) => {
    const d = NC.toDate(ts);
    return d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  };
  NC.ago = (ts) => {
    const d = NC.toDate(ts);
    if (!d) return '';
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return "À l'instant";
    if (s < 3600) return 'Il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'Il y a ' + Math.floor(s / 3600) + ' h';
    if (s < 7 * 86400) return 'Il y a ' + Math.floor(s / 86400) + ' j';
    return NC.fmtDate(d);
  };
  NC.money = (n) => (Number(n) || 0).toLocaleString('fr-FR') + ' GNF';
  NC.sortByDate = (arr, key) => arr.sort((a, b) => ((NC.toDate(b[key || 'createdAt']) || 0) - (NC.toDate(a[key || 'createdAt']) || 0)));

  // Identifiants générés pour les comptes créés par une école
  const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  NC.randomString = (n, alphabet) => {
    const chars = alphabet || ALNUM;
    const bytes = crypto.getRandomValues(new Uint32Array(n));
    return Array.from(bytes, (b) => chars[b % chars.length]).join('');
  };
  NC.genPassword = () => NC.randomString(4, 'ABCDEFGHJKLMNPQRSTUVWXYZ') + NC.randomString(4, '23456789');

  // Un identifiant ELEV-XXXXXX ou PROF-XXXXXX devient l'email technique du compte
  NC.loginToEmail = (value) => {
    const v = String(value || '').trim();
    if (/^(ELEV|PROF)-[A-Z0-9]{6}$/i.test(v)) return v.toUpperCase() + '@neoclass.com';
    return v;
  };

  // Normalisation pour comparer des niveaux et des classes ("10ème année" == "10EME ANNEE")
  NC.norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Texte simple vers HTML sûr (titres ###, gras **, paragraphes)
  NC.richText = function (text) {
    const lines = NC.esc(text || '').split(/\r?\n/);
    let html = '';
    let para = [];
    const flush = () => { if (para.length) { html += '<p>' + para.join('<br>') + '</p>'; para = []; } };
    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) { flush(); return; }
      const h = line.match(/^(#{2,4})\s+(.*)$/);
      if (h) { flush(); html += h[1].length <= 3 ? '<h3>' + h[2] + '</h3>' : '<h4>' + h[2] + '</h4>'; return; }
      para.push(line);
    });
    flush();
    return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  };

  NC.youtubeId = (url) => {
    const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : '';
  };

  // Supprime les emojis des textes venant de l'ancienne base
  NC.clean = (s) => String(s == null ? '' : s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // ---------- Icônes (traits, 24 x 24) ----------
  const ICONS = {
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V13h6v9"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    quiz: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    assistant: '<path d="M12 3v2M12 19v2M5 12H3M21 12h-2"/><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M10 11h.01M14 11h.01M10 14.5c1.2.8 2.8.8 4 0"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    school: '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M10 21v-5h4v5"/><path d="M10 10h4"/>',
    wallet: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    grades: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    megaphone: '<path d="m3 11 16-6v14L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m22 8-5 4 5 4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'
  };
  NC.icon = (name, size) => {
    const s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
    return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"' + s + '>' + (ICONS[name] || ICONS.info) + '</svg>';
  };

  // ---------- Composants ----------
  NC.logo = (lg) => '<span class="logo' + (lg ? ' logo-lg' : '') + '"><span class="logo-mark">N</span><span>Neoclass</span></span>';

  NC.avatar = (p, cls) => {
    const url = p && p.photoURL;
    const name = NC.displayName(p);
    return '<span class="avatar ' + (cls || '') + '">' +
      (url ? '<img src="' + NC.esc(url) + '" alt="" onerror="this.remove()">' : '') +
      NC.esc(NC.initials(name)) + '</span>';
  };

  NC.pageHead = (title, sub) =>
    '<div class="page-head"><h1>' + NC.esc(title) + '</h1>' + (sub ? '<p>' + NC.esc(sub) + '</p>' : '') + '</div>';

  NC.empty = (o) =>
    '<div class="empty"><div class="tile-icon">' + NC.icon(o.icon || 'inbox') + '</div>' +
    '<h3>' + NC.esc(o.title) + '</h3>' + (o.text ? '<p>' + NC.esc(o.text) + '</p>' : '') +
    (o.action ? '<a class="btn" href="#' + o.action.href + '">' + NC.esc(o.action.label) + '</a>' : '') + '</div>';

  NC.skeleton = (n) => Array.from({ length: n || 4 }, () => '<div class="skeleton sk-row"></div>').join('');

  NC.errorView = (err) => {
    console.error(err);
    const denied = err && (err.code === 'permission-denied' || /permission/i.test(err.message || ''));
    return NC.empty({
      icon: denied ? 'lock' : 'info',
      title: denied ? 'Accès non autorisé' : 'Chargement impossible',
      text: denied ? "Votre compte n'a pas accès à ces informations." : 'Vérifiez votre connexion internet puis réessayez.'
    });
  };

  NC.row = (o) => {
    const tag = o.href ? 'a' : (o.onclick ? 'button' : 'div');
    const attrs = o.href ? ' href="#' + o.href + '"' : (o.onclick ? ' type="button" data-action="' + NC.esc(o.onclick) + '"' : '');
    const cls = 'row' + (tag === 'div' ? ' row-static' : '') + (o.unread ? ' unread' : '');
    const lead = o.lead || (o.icon ? '<span class="row-icon' + (o.brand ? ' brand' : '') + '">' + NC.icon(o.icon) + '</span>' : '');
    return '<' + tag + ' class="' + cls + '"' + attrs + (o.data ? ' ' + o.data : '') + '>' + lead +
      '<span class="row-main"><span class="row-title">' + NC.esc(o.title) + '</span>' +
      (o.sub ? '<span class="row-sub">' + NC.esc(o.sub) + '</span>' : '') + '</span>' +
      '<span class="row-end">' + (o.end || '') + (tag !== 'div' ? NC.icon('chevron', 18) : '') + '</span></' + tag + '>';
  };

  NC.tile = (o) =>
    '<a class="tile" href="#' + o.href + '"><span class="tile-icon">' + NC.icon(o.icon) + '</span>' +
    '<strong>' + NC.esc(o.title) + '</strong><small>' + NC.esc(o.text) + '</small></a>';

  NC.stat = (value, label, id) =>
    '<div class="stat"><b' + (id ? ' id="' + id + '"' : '') + '>' + NC.esc(value) + '</b><span>' + NC.esc(label) + '</span></div>';

  NC.badge = (text, kind) => '<span class="badge ' + (kind || '') + '">' + NC.esc(text) + '</span>';

  // Notifications courtes
  NC.toast = function (msg, type) {
    let box = NC.$('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = (type === 'success' ? NC.icon('check', 18) : type === 'error' ? NC.icon('info', 18) : '') + '<span>' + NC.esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  // Fenêtre en bas de l'écran (plein centre sur ordinateur)
  NC.sheet = function (o) {
    const back = document.createElement('div');
    back.className = 'sheet-backdrop';
    back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + NC.esc(o.title || '') + '">' +
      '<div class="sheet-grip"></div><div class="sheet-head"><h2>' + NC.esc(o.title || '') + '</h2>' +
      '<button class="icon-btn" data-close aria-label="Fermer">' + NC.icon('close') + '</button></div>' +
      '<div class="sheet-body">' + (o.body || '') + '</div></div>';
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); if (o.onClose) o.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    back.addEventListener('click', (e) => { if (e.target === back || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    const first = back.querySelector('input, select, textarea');
    if (first && window.innerWidth > 640) first.focus();
    return { el: back.querySelector('.sheet'), close };
  };

  NC.confirm = (title, text, okLabel, danger) => new Promise((resolve) => {
    let done = false;
    const s = NC.sheet({
      title,
      body: '<p class="muted">' + NC.esc(text) + '</p><div class="sheet-actions">' +
        '<button class="btn btn-secondary" data-no>Annuler</button>' +
        '<button class="btn ' + (danger ? 'btn-danger' : '') + '" data-yes>' + NC.esc(okLabel || 'Confirmer') + '</button></div>',
      onClose: () => { if (!done) resolve(false); }
    });
    s.el.querySelector('[data-no]').onclick = () => s.close();
    s.el.querySelector('[data-yes]').onclick = () => { done = true; s.close(); resolve(true); };
  });

  // Bouton en attente pendant une action asynchrone
  NC.busy = async (btn, fn) => {
    if (btn) { btn.classList.add('loading'); btn.disabled = true; }
    try { return await fn(); } finally { if (btn) { btn.classList.remove('loading'); btn.disabled = false; } }
  };

  NC.formData = (form) => {
    const out = {};
    new FormData(form).forEach((v, k) => { out[k] = typeof v === 'string' ? v.trim() : v; });
    return out;
  };

  NC.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); NC.toast('Copié', 'success'); } catch (e) { NC.toast('Copie impossible', 'error'); }
  };

  NC.authError = (err) => {
    const code = (err && err.code) || '';
    const map = {
      'auth/user-not-found': 'Aucun compte avec cet identifiant.',
      'auth/wrong-password': 'Identifiant ou mot de passe incorrect.',
      'auth/invalid-credential': 'Identifiant ou mot de passe incorrect.',
      'auth/invalid-login-credentials': 'Identifiant ou mot de passe incorrect.',
      'auth/invalid-email': "L'adresse email n'est pas valide.",
      'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
      'auth/network-request-failed': 'Pas de connexion internet.'
    };
    return map[code] || 'Une erreur est survenue. Réessayez.';
  };

  // ---------- Assistant IA (proxy serveur, la clé reste côté serveur) ----------
  NC.askAI = async function (prompt) {
    const p = NC.state.profile || {};
    const res = await fetch('/.netlify/functions/mistral-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userContext: { role: p.role, level: p.level || p.className || '', system: p.system || 'guinea' } })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const answer = data.response || data.answer;
    if (!answer || typeof answer !== 'string') throw new Error('Réponse vide');
    return NC.clean(answer);
  };

  // ---------- Thème ----------
  NC.getTheme = () => { try { return localStorage.getItem('nc_theme') || 'auto'; } catch (e) { return 'auto'; } };
  NC.setTheme = (t) => {
    try { localStorage.setItem('nc_theme', t); } catch (e) { /* stockage indisponible */ }
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  };
  NC.setTheme(NC.getTheme());
})();
