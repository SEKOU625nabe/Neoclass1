/* ============================================================
   Navigation : onglets par rôle, routes, cadre de l'application
   ============================================================ */
(function () {
  'use strict';
  const NC = window.NC;

  // Quatre fonctions au maximum par rôle, plus le compte.
  // Un libellé court et une icône : on comprend l'application d'un coup d'œil.
  const TABS = {
    student: [
      { path: '/', label: 'Accueil', icon: 'home' },
      { path: '/courses', label: 'Cours', icon: 'book' },
      { path: '/quiz', label: 'Exercices', icon: 'quiz' },
      { path: '/assistant', label: 'Assistant', icon: 'assistant' },
      { path: '/account', label: 'Compte', icon: 'user' }
    ],
    teacher: [
      { path: '/', label: 'Accueil', icon: 'home' },
      { path: '/teach/courses', label: 'Mes cours', icon: 'book' },
      { path: '/teach/quiz', label: 'Exercices', icon: 'quiz' },
      { path: '/teach/grades', label: 'Notes', icon: 'grades' },
      { path: '/account', label: 'Compte', icon: 'user' }
    ],
    school: [
      { path: '/', label: 'Accueil', icon: 'home' },
      { path: '/school/students', label: 'Élèves', icon: 'cap' },
      { path: '/school/teachers', label: 'Enseignants', icon: 'users' },
      { path: '/school/payments', label: 'Paiements', icon: 'wallet' },
      { path: '/account', label: 'Compte', icon: 'user' }
    ],
    parent: [
      { path: '/', label: 'Accueil', icon: 'home' },
      { path: '/parent/grades', label: 'Notes', icon: 'grades' },
      { path: '/messages', label: 'Messages', icon: 'message' },
      { path: '/account', label: 'Compte', icon: 'user' }
    ],
    admin: [
      { path: '/', label: 'Accueil', icon: 'home' },
      { path: '/admin/users', label: 'Utilisateurs', icon: 'users' },
      { path: '/admin/courses', label: 'Cours', icon: 'book' },
      { path: '/admin/broadcast', label: 'Annonces', icon: 'megaphone' },
      { path: '/account', label: 'Compte', icon: 'user' }
    ]
  };
  NC.tabs = () => TABS[NC.group()] || TABS.student;

  // ---------- Déclaration des routes ----------
  const routes = [];
  NC.route = function (pattern, def) {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/\/:(\w+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$');
    routes.push(Object.assign({ pattern, rx, keys }, def));
  };

  NC.go = (path, replace) => {
    const url = '#' + path;
    if (replace) { history.replaceState(null, '', url); render(); } else if (location.hash === url) render(); else location.hash = url;
  };
  NC.back = (fallback) => {
    if (history.state && history.state.nc && history.length > 1) history.back();
    else NC.go(fallback || '/');
  };
  NC.refresh = () => render();

  function currentPath() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    return { path, query: new URLSearchParams(qs || '') };
  }

  function match(path) {
    for (const r of routes) {
      const m = path.match(r.rx);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { r, params };
      }
    }
    return null;
  }

  // ---------- Cadre (barre du haut, onglets, menu latéral) ----------
  function shell(def, params) {
    const tabs = NC.tabs();
    const active = def.tab || currentPath().path;
    const title = typeof def.title === 'function' ? def.title(params) : def.title;
    const p = NC.state.profile;
    const link = (t, cls) => '<a class="' + cls + (t.path === active ? ' active' : '') + '" href="#' + t.path + '"' +
      (t.path === active ? ' aria-current="page"' : '') + '>' + NC.icon(t.icon) + '<span>' + t.label + '</span></a>';
    const showBell = NC.group() !== 'parent' && active !== '/messages';
    return '<div class="shell">' +
      '<nav class="rail" aria-label="Menu principal">' + NC.logo() + tabs.map((t) => link(t, 'rail-link')).join('') +
        '<div class="rail-foot"><a class="rail-link" href="#/account">' + NC.avatar(p) + '<span>' + NC.esc(NC.firstName(p) || 'Mon compte') + '</span></a></div>' +
      '</nav>' +
      '<header class="topbar">' +
        (def.back ? '<button class="icon-btn" data-back aria-label="Retour">' + NC.icon('back') + '</button>' : '') +
        '<div class="topbar-title" id="topTitle">' + NC.esc(title || '') + '</div>' +
        (showBell ? '<a class="icon-btn" href="#/messages" aria-label="Messages">' + NC.icon('bell') +
          '<span class="dot" id="unreadDot"' + (NC.state.unread ? '' : ' hidden') + '>' + (NC.state.unread > 9 ? '9+' : NC.state.unread) + '</span></a>' : '') +
      '</header>' +
      '<main class="main" id="main"><div class="' + (def.full ? 'chat' : 'view' + (def.narrow ? ' view-narrow' : '')) + '" id="view"></div></main>' +
      '<nav class="tabbar" aria-label="Onglets">' + tabs.map((t) => link(t, 'tab')).join('') + '</nav>' +
      '</div>';
  }

  NC.setTitle = (t) => { const el = NC.$('#topTitle'); if (el) el.textContent = t; };
  NC.setUnread = (n) => {
    NC.state.unread = n;
    const d = NC.$('#unreadDot');
    if (d) { d.hidden = !n; d.textContent = n > 9 ? '9+' : n; }
  };

  // ---------- Rendu ----------
  let actions = {};
  NC.actions = (map) => { actions = map || {}; };

  function render() {
    const root = NC.$('#root');
    const { path, query } = currentPath();
    const loggedIn = !!NC.state.profile;

    if (!history.state || !history.state.nc) history.replaceState({ nc: true }, '', location.href);

    let found = match(path);
    if (!found) return NC.go(loggedIn ? '/' : '/welcome', true);
    let { r, params } = found;

    if (r.guest && loggedIn) return NC.go('/', true);
    if (!r.guest && !loggedIn) return NC.go('/welcome', true);
    if (loggedIn && r.roles && r.roles.indexOf(NC.group()) === -1) return NC.go('/', true);

    // Un élève doit d'abord choisir son niveau
    const p = NC.state.profile;
    if (loggedIn && NC.group() === 'student' && !p.level && !p.className && !p.classLevel && r.pattern !== '/onboarding') {
      return NC.go('/onboarding', true);
    }

    actions = {};
    if (r.bare) {
      root.innerHTML = '<div id="view"></div>';
    } else {
      root.innerHTML = shell(r, params);
      NC.$('#main').scrollTop = 0;
    }
    const view = NC.$('#view');
    document.title = (typeof r.title === 'function' ? r.title(params) : r.title || 'Neoclass') + ' – Neoclass';
    try {
      const out = r.render(view, params, query);
      if (out && out.catch) out.catch((e) => { view.innerHTML = NC.errorView(e); });
    } catch (e) {
      view.innerHTML = NC.errorView(e);
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) { e.preventDefault(); NC.back(); return; }
    const a = e.target.closest('[data-action]');
    if (a) {
      const [name, ...rest] = a.getAttribute('data-action').split(':');
      if (actions[name]) { e.preventDefault(); actions[name](rest.join(':'), a, e); }
    }
  });

  window.addEventListener('hashchange', () => {
    if (!history.state || !history.state.nc) history.replaceState({ nc: true }, '', location.href);
    render();
  });

  NC.start = render;
})();
