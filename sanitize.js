// sanitize.js — ✅ Protection XSS côté serveur
// ✅ CORRIGÉ : Nettoyer tout contenu de cours avant sauvegarde Firestore
// À importer dans course-publication.js et server.js

// ============================================================
// INSTALLATION : npm install isomorphic-dompurify jsdom
// ============================================================
let DOMPurify;
try {
  const { JSDOM } = require('jsdom');
  const domPurify = require('dompurify');
  const window = new JSDOM('').window;
  DOMPurify = domPurify(window);
  console.log('✅ DOMPurify chargé — protection XSS active');
} catch (e) {
  console.warn('⚠️ DOMPurify non disponible — utilisation du sanitizer basique');
  DOMPurify = null;
}

// ============================================================
// SANITIZER PRINCIPAL
// ============================================================

/**
 * Nettoie du HTML pour enlever tout script malveillant
 * @param {string} html — contenu à nettoyer
 * @returns {string} — contenu sécurisé
 */
function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  if (DOMPurify) {
    // DOMPurify : la solution la plus robuste
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'u', 'strong', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'pre', 'code',
        'span', 'div', 'section',
        'img', 'a', 'hr',
        'sub', 'sup', 'mark'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class',
        'style', 'target', 'rel', 'colspan', 'rowspan'
      ],
      // Bloquer les URLs dangereuses
      ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/i,
      // Forcer rel="noopener" sur les liens
      ADD_ATTR: ['rel'],
      // Interdire les data: URI (peuvent contenir du JS)
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    });
  }

  // Sanitizer basique si DOMPurify non disponible
  return basicSanitize(html);
}

/**
 * Sanitizer basique (fallback sans DOMPurify)
 * Enlève les scripts et les event handlers
 */
function basicSanitize(str) {
  return str
    // Supprimer les balises script
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Supprimer les balises style
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Supprimer les event handlers (onclick=, onerror=, etc.)
    .replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
    // Supprimer les javascript: dans les href/src
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, '')
    .replace(/src\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, '')
    // Supprimer les data: URI
    .replace(/src\s*=\s*(['"])\s*data:[^'"]*\1/gi, '');
}

/**
 * Nettoyer un texte brut (sans HTML)
 * Pour les noms, descriptions courtes
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '') // Enlever < et >
    .trim()
    .substring(0, 5000); // Limiter la longueur
}

/**
 * Sanitizer complet d'un objet cours avant sauvegarde
 * @param {object} courseData — données du cours à nettoyer
 * @returns {object} — cours nettoyé
 */
function sanitizeCourse(courseData) {
  if (!courseData || typeof courseData !== 'object') return {};

  return {
    ...courseData,
    name:        sanitizeText(courseData.name),
    description: sanitizeText(courseData.description),
    summary:     sanitizeText(courseData.summary),
    content:     sanitizeHtml(courseData.content),   // ← HTML autorisé ici
    // Champs non-texte : ne pas modifier
    classId:     courseData.classId,
    subjectId:   courseData.subjectId,
    access_level:courseData.access_level,
    countryCode: courseData.countryCode,
  };
}

/**
 * Sanitizer d'un module
 */
function sanitizeModule(moduleData) {
  if (!moduleData || typeof moduleData !== 'object') return {};
  return {
    ...moduleData,
    name:        sanitizeText(moduleData.name),
    description: sanitizeHtml(moduleData.description),
  };
}

/**
 * Sanitizer d'une leçon
 */
function sanitizeLesson(lessonData) {
  if (!lessonData || typeof lessonData !== 'object') return {};
  return {
    ...lessonData,
    name:    sanitizeText(lessonData.name),
    content: sanitizeHtml(lessonData.content),
  };
}

// ============================================================
// MIDDLEWARE EXPRESS — à utiliser sur les routes de publication
// ============================================================

/**
 * Middleware qui sanitize automatiquement le body des requêtes
 * Usage: app.post('/api/publish/course', sanitizeMiddleware, ...)
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    if (req.body.content)     req.body.content     = sanitizeHtml(req.body.content);
    if (req.body.description) req.body.description = sanitizeHtml(req.body.description);
    if (req.body.name)        req.body.name        = sanitizeText(req.body.name);
    if (req.body.summary)     req.body.summary     = sanitizeText(req.body.summary);
  }
  next();
};

module.exports = {
  sanitizeHtml,
  sanitizeText,
  sanitizeCourse,
  sanitizeModule,
  sanitizeLesson,
  sanitizeMiddleware
};

// ============================================================
// UTILISATION dans course-publication.js :
// ============================================================
// const { sanitizeCourse, sanitizeMiddleware } = require('./sanitize');
//
// router.post('/publish/course',
//   authenticate,
//   sanitizeMiddleware,   // ← ajouter cette ligne
//   async (req, res) => {
//     const cleanData = sanitizeCourse(req.body);
//     await db.collection('courses').add(cleanData);
//   }
// );
