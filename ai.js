// ai.js — Serveur IA Darx (Mistral Conversations API)
// ✅ Corrigé : CONVERSATIONS_API_URL, APP_CONFIG, CORS production
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));

// ============================================================
// ✅ CORRECTION 1 : Variables manquantes (causaient un crash)
// ============================================================
const CONVERSATIONS_API_URL = 'https://api.mistral.ai/v1/agents/completions';

const APP_CONFIG = {
  NOM_IA: 'Darx',
  SYSTEME: 'Guinéen / Franco-Arabe',
  VERSION: '4.0',
  DEFAULT_COUNTRY: 'GN'
};

// ============================================================
// ✅ CORRECTION 2 : CORS — accepte localhost ET ton domaine Netlify
// ============================================================
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  // ⬇️ Remplace par ton vrai domaine Netlify
  process.env.FRONTEND_URL || 'https://neoclass.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // En dev : tout autoriser
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`Origine non autorisée: ${origin}`));
  },
  credentials: true
}));

// ============================================================
// Clés API depuis les variables d'environnement
// ============================================================
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const AGENT_ID = process.env.MISTRAL_AGENT_ID;

if (!MISTRAL_API_KEY) {
  console.warn('⚠️  MISTRAL_API_KEY non définie !');
}
if (!AGENT_ID) {
  console.warn('⚠️  MISTRAL_AGENT_ID non défini !');
}

// ============================================================
// Messages d'encouragement pour le BAC
// ============================================================
const ENCOURAGEMENTS_BAC = [
  "Courage, le chemin vers l'université commence ici ! 🎓",
  "Chaque effort te rapproche du succès au BAC ! 💪",
  "Tu es sur la bonne voie, futur bachelier ! 🌟",
  "Le BAC n'est qu'une étape, tu vas y arriver ! 🚀",
  "Continue comme ça, l'excellence est à portée de main ! ✨",
  "Les grands réussissent parce qu'ils n'abandonnent jamais ! 🏆",
  "Ton avenir brillant se construit maintenant ! 🌈"
];

// ============================================================
// Réponses de secours si l'API Mistral est indisponible
// ============================================================
const fallbackResponses = {
  greeting: [
    "Bonjour ! Je suis Darx, ton assistant IA. Comment puis-je t'aider aujourd'hui ? 😊",
    "Salut ! Je suis là pour t'aider dans tes études. Pose-moi une question ! 📚"
  ],
  math: "Je peux t'aider avec les maths ! Donne-moi plus de détails sur ton problème.",
  science: "La science c'est passionnant ! Quel sujet t'intéresse : physique, chimie, biologie ?",
  french: "Le français est une belle langue. Tu as une question de grammaire, conjugaison ou littérature ?",
  default: "Je suis ton assistant éducatif Darx. Je peux t'aider avec tes devoirs, expliquer des concepts, et répondre à tes questions. Que veux-tu savoir ?"
};

function getFallbackResponse(prompt) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('bonjour') || p.includes('salut') || p.includes('hello')) {
    return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
  }
  if (p.includes('math') || p.includes('calcul') || p.includes('équation')) return fallbackResponses.math;
  if (p.includes('physique') || p.includes('chimie') || p.includes('science')) return fallbackResponses.science;
  if (p.includes('français') || p.includes('grammaire') || p.includes('conjugaison')) return fallbackResponses.french;
  return fallbackResponses.default;
}

function addBacEncouragement(answer, userContext) {
  if (!userContext) return answer;
  const { classe, role } = userContext;
  if (
    (role === 'student' || role === 'indep_student' || role === 'eleve') &&
    classe && (classe.includes('Terminale') || classe.includes('12'))
  ) {
    if (Math.random() < 0.3) {
      const msg = ENCOURAGEMENTS_BAC[Math.floor(Math.random() * ENCOURAGEMENTS_BAC.length)];
      return answer + '\n\n---\n💪 ' + msg;
    }
  }
  return answer;
}

// ============================================================
// Health check
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Darx AI server is running',
    api: MISTRAL_API_KEY ? 'configured' : 'MISSING',
    agent: AGENT_ID ? 'configured' : 'MISSING'
  });
});

// ============================================================
// POST /api/darx — Réponse texte
// ============================================================
app.post('/api/darx', async (req, res) => {
  const { prompt, userContext } = req.body;
  console.log('📩 /api/darx — prompt:', (prompt || '').substring(0, 80));

  if (!prompt || prompt.trim() === '') {
    return res.json({ answer: "Écris quelque chose pour que je puisse t'aider !" });
  }

  // Vérification clé API
  if (!MISTRAL_API_KEY || !AGENT_ID) {
    console.error('❌ Clés Mistral manquantes');
    return res.json({ answer: getFallbackResponse(prompt), fallback: true, error: 'config' });
  }

  try {
    const ctx = userContext || {};
    let contextPrefix = '';

    if (ctx.role || ctx.classe || ctx.nom) {
      contextPrefix = '[CONTEXTE: ';
      if (ctx.nom) contextPrefix += `Utilisateur: ${ctx.nom}. `;
      if (ctx.role === 'teacher' || ctx.role === 'indep_teacher') {
        contextPrefix += `Professeur${ctx.matiere ? ' de ' + ctx.matiere : ''}. `;
      } else if (ctx.role === 'student' || ctx.role === 'indep_student') {
        contextPrefix += `Élève${ctx.classe ? ' de ' + ctx.classe : ''}${ctx.serie ? ' série ' + ctx.serie : ''}. `;
      } else if (ctx.role === 'parent') {
        contextPrefix += "Parent d'élève. ";
      }
      contextPrefix += '] ';
    }

    const fullPrompt = contextPrefix + prompt;

    const payload = {
      agent_id: AGENT_ID,
      agent_version: 6,
      inputs: [{ role: 'user', content: fullPrompt }]
    };

    const response = await fetch(CONVERSATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Mistral status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral error:', response.status, errorText);
      return res.json({ answer: getFallbackResponse(prompt), fallback: true });
    }

    const data = await response.json();

    let answer =
      data.outputs?.[0]?.content ||
      data.choices?.[0]?.message?.content ||
      data.response ||
      data.content ||
      data.message?.content;

    if (!answer || answer.trim() === '') {
      return res.json({ answer: getFallbackResponse(prompt), fallback: true });
    }

    answer = addBacEncouragement(answer, ctx);
    console.log('✅ Réponse OK:', answer.substring(0, 80));
    res.json({ answer });

  } catch (e) {
    console.error('❌ Erreur /api/darx:', e.message);
    res.json({ answer: getFallbackResponse(prompt), fallback: true });
  }
});

// ============================================================
// POST /api/darx-vision — Analyse d'image
// ============================================================
app.post('/api/darx-vision', async (req, res) => {
  const { prompt, imageBase64, additionalImages, userContext } = req.body;

  if (!imageBase64) {
    return res.json({ answer: 'Image manquante' });
  }

  if (!MISTRAL_API_KEY || !AGENT_ID) {
    return res.json({ answer: "Service IA non configuré. Essaie de décrire ton problème en texte." });
  }

  try {
    const content = [
      { type: 'text', text: prompt || "Décris cette image et aide-moi à comprendre le contenu éducatif." },
      { type: 'image_url', image_url: imageBase64 }
    ];

    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach(img => {
        if (img) content.push({ type: 'image_url', image_url: img });
      });
      console.log(`Total images: ${1 + additionalImages.filter(i => i).length}`);
    }

    const payload = {
      agent_id: AGENT_ID,
      inputs: [{ role: 'user', content }]
    };

    const response = await fetch(CONVERSATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision error:', response.status, errorText);
      return res.json({ answer: "Je n'ai pas pu analyser l'image. Essaie de décrire ton problème en texte." });
    }

    const data = await response.json();
    let answer =
      data.outputs?.[0]?.content ||
      data.choices?.[0]?.message?.content ||
      data.response;

    if (userContext) {
      answer = addBacEncouragement(answer, userContext);
    }

    res.json({ answer: answer || "Je n'ai pas pu analyser cette image." });

  } catch (e) {
    console.error('Vision error:', e.message);
    res.json({ answer: "Désolé, je n'ai pas pu analyser l'image. Essaie de décrire ton problème en texte." });
  }
});

// ============================================================
// POST /api/darx-welcome — Message de bienvenue personnalisé
// ============================================================
app.post('/api/darx-welcome', (req, res) => {
  const { userProfile } = req.body;

  if (!userProfile) {
    return res.json({ message: "Bonjour ! Je suis Darx, ton assistant IA. Comment puis-je t'aider ? 🤖" });
  }

  const { role, fullName, nom, classe, niveau, matiere, serie } = userProfile;
  const userName = fullName || nom || 'cher utilisateur';
  let message = '';

  if (role === 'teacher' || role === 'indep_teacher') {
    message = `Bonjour Cher Collègue **${userName}** ! 👋\n\nRavi de vous revoir sur Neoclass. Je suis **Darx**, votre assistant pédagogique intelligent.\n\nJe suis prêt à vous aider pour :\n- 📝 Préparer vos supports de cours${matiere ? ` en **${matiere}**` : ''}\n- ✅ Créer des évaluations et exercices\n- 📊 Analyser les résultats de vos élèves\n\nQue puis-je faire pour vous aujourd'hui ?`;
  } else if (role === 'student' || role === 'indep_student') {
    const classeDisplay = classe || niveau || '';
    const serieDisplay = serie ? ` série ${serie}` : '';
    message = `Salut **${userName}** ! 👋\n\n`;
    if (classeDisplay.includes('Terminale') || classeDisplay.includes('12')) {
      message += `Prêt pour tes révisions du **BAC** en ${classeDisplay}${serieDisplay} ? 🎓\n\n`;
      message += `Je suis **Darx**, ton coach de révision ! Envoie-moi :\n`;
      message += `- 📸 Une photo de ton exercice\n- ❓ Ta question en maths, physique, français...\n- 📝 Un sujet type BAC à réviser\n\n`;
      message += `Ensemble, on décroche ce BAC ! 💪`;
    } else {
      message += `Prêt pour tes révisions${classeDisplay ? ` en **${classeDisplay}**` : ''} ? 📚\n\n`;
      message += `Je suis **Darx**, ton assistant personnel ! Pose-moi ta question ou envoie-moi une photo de ton exercice, on va bosser ça ensemble ! 🚀`;
    }
  } else if (role === 'parent') {
    message = `Bonjour **${userName}** ! 👋\n\nJe suis **Darx**, l'assistant IA de Neoclass.\n\nJe peux vous aider à :\n- 📊 Comprendre les progrès de votre enfant\n- 💡 Trouver des conseils pour l'accompagner\n- ❓ Répondre à vos questions sur le programme\n\nComment puis-je vous aider ?`;
  } else if (role === 'school') {
    message = `Bonjour et bienvenue sur Neoclass ! 🏫\n\nJe suis **Darx**, l'assistant IA de la plateforme.\n\nJe peux vous aider avec la gestion de votre établissement et répondre à vos questions. Comment puis-je vous assister ?`;
  } else {
    message = `Bonjour ! Je suis **Darx**, l'assistant IA intelligent de Neoclass. 🤖\n\nJe suis là pour t'aider dans tes études. Pose-moi une question ou envoie-moi une photo d'exercice !`;
  }

  res.json({ message });
});

// ============================================================
// Démarrage
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Darx AI server → http://localhost:${PORT}`);
  console.log(`   MISTRAL_API_KEY : ${MISTRAL_API_KEY ? '✓ définie' : '✗ MANQUANTE'}`);
  console.log(`   MISTRAL_AGENT_ID: ${AGENT_ID ? '✓ défini' : '✗ MANQUANT'}`);
  console.log('═══════════════════════════════════════════');
});
