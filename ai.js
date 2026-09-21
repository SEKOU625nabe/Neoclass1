// ai.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS : liste blanche d'origines. En production, toute origine
// inconnue est refusee (evite qu'un site tiers consomme la cle Mistral).
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL || 'https://neoclass.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error('Origine non autorisee: ' + origin));
  },
  credentials: true
}));

// Configuration centralisée
const APP_CONFIG = {
  NOM_IA: "Darx",
  SYSTEME: "Guinéen / Franco-Arabe"
};

// Secrets lus depuis l'environnement — jamais en dur dans le code.
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const AGENT_ID = process.env.MISTRAL_AGENT_ID;
const CONVERSATIONS_API_URL = 'https://api.mistral.ai/v1/conversations';

if (!MISTRAL_API_KEY || !AGENT_ID) {
  console.error('[FATAL] MISTRAL_API_KEY et MISTRAL_AGENT_ID sont requis. Voir .env.example.');
  process.exit(1);
}

// Messages d'encouragement pour le BAC
const ENCOURAGEMENTS_BAC = [
  "Courage, le chemin vers l'université commence ici ! 🎓",
  "Chaque effort te rapproche du succès au BAC ! 💪",
  "Tu es sur la bonne voie, futur bachelier ! 🌟",
  "Le BAC n'est qu'une étape, tu vas y arriver ! 🚀",
  "Continue comme ça, l'excellence est à portée de main ! ✨",
  "Les grands réussissent parce qu'ils n'abandonnent jamais ! 🏆",
  "Ton avenir brillant se construit maintenant ! 🌈"
];

// System prompt enrichi pour Darx
function getSystemPrompt(userContext) {
  const { role, classe, niveau, matiere, nom, serie } = userContext || {};
  
  let systemPrompt = `Tu es ${APP_CONFIG.NOM_IA}, un assistant IA éducatif intelligent pour la plateforme Neoclass. 
Tu aides les élèves et professeurs du système éducatif ${APP_CONFIG.SYSTEME}.

RÈGLES IMPORTANTES:
- Réponds toujours en français clair et accessible
- Utilise le formatage Markdown pour structurer tes réponses (gras, tableaux, listes)
- Pour les maths, utilise les symboles appropriés et aligne bien les formules
- Sois encourageant et pédagogue
- Adapte ton niveau de langage à ton interlocuteur`;

  if (role === 'teacher' || role === 'indep_teacher' || role === 'professeur') {
    systemPrompt += `

CONTEXTE: Tu parles à un(e) professeur${matiere ? ` de ${matiere}` : ''}.
- Aide-le/la à préparer des cours, des évaluations, des exercices
- Propose des ressources pédagogiques adaptées
- Utilise un ton professionnel et collégial`;
  } else if (role === 'student' || role === 'indep_student' || role === 'eleve') {
    systemPrompt += `

CONTEXTE: Tu parles à un(e) élève${classe ? ` de ${classe}` : ''}${serie ? ` série ${serie}` : ''}.
- Explique de manière simple et progressive
- Donne des exemples concrets
- Vérifie la compréhension
- Encourage l'apprentissage actif`;

    // Si c'est un élève de Terminale (12ème)
    if (classe && (classe.includes('Terminale') || classe.includes('12'))) {
      systemPrompt += `

SPÉCIAL BAC: Cet élève prépare le Baccalauréat guinéen.
- Concentre-toi sur les notions au programme du BAC
- Donne des conseils de méthodologie d'examen
- Termine occasionnellement tes réponses par une phrase d'encouragement pour le BAC`;
    }
  } else if (role === 'parent') {
    systemPrompt += `

CONTEXTE: Tu parles à un parent d'élève.
- Aide à comprendre les difficultés de l'enfant
- Propose des conseils pour accompagner l'apprentissage à la maison
- Sois rassurant et constructif`;
  }

  return systemPrompt;
}

// Réponses de secours en cas d'erreur API
const fallbackResponses = {
  greeting: ["Bonjour ! Je suis Darx, ton assistant IA. Comment puis-je t'aider aujourd'hui ? 😊", "Salut ! Je suis là pour t'aider dans tes études. Pose-moi une question ! 📚"],
  math: "Je peux t'aider avec les maths ! Donne-moi plus de détails sur ton problème.",
  science: "La science c'est passionnant ! Quel sujet t'intéresse : physique, chimie, biologie ?",
  french: "Le français est une belle langue. Tu as une question de grammaire, conjugaison ou littérature ?",
  default: "Je suis ton assistant éducatif Darx. Je peux t'aider avec tes devoirs, expliquer des concepts, et répondre à tes questions. Que veux-tu savoir ?"
};

function getFallbackResponse(prompt) {
  const p = prompt.toLowerCase();
  if(p.includes('bonjour') || p.includes('salut') || p.includes('hello') || p.includes('hi')) {
    return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
  }
  if(p.includes('math') || p.includes('calcul') || p.includes('équation')) {
    return fallbackResponses.math;
  }
  if(p.includes('physique') || p.includes('chimie') || p.includes('science')) {
    return fallbackResponses.science;
  }
  if(p.includes('français') || p.includes('grammaire') || p.includes('conjugaison')) {
    return fallbackResponses.french;
  }
  return fallbackResponses.default;
}

// Test de connexion
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Darx AI server is running with Mistral Conversations API' });
});

// Ajouter un encouragement BAC si applicable
function addBacEncouragement(answer, userContext) {
  if (!userContext) return answer;
  const { classe, role } = userContext;
  
  // Seulement pour les élèves de Terminale, 30% de chance
  if ((role === 'student' || role === 'indep_student' || role === 'eleve') && 
      classe && (classe.includes('Terminale') || classe.includes('12'))) {
    if (Math.random() < 0.3) {
      const encouragement = ENCOURAGEMENTS_BAC[Math.floor(Math.random() * ENCOURAGEMENTS_BAC.length)];
      return answer + '\n\n---\n💪 ' + encouragement;
    }
  }
  return answer;
}

// Texte uniquement - Mistral AI Conversations API
app.post('/api/darx', async (req, res) => {
  const { prompt, userContext } = req.body;
  console.log('Requête reçue sur /api/darx, prompt:', prompt, 'context:', userContext);
  
  if (!prompt || prompt.trim() === '') {
    return res.json({ answer: 'Écris quelque chose pour que je puisse t\'aider !' });
  }
  
  try {
    // Construire le contexte utilisateur pour le prompt
    const ctx = userContext || {};
    let contextPrefix = '';
    
    if (ctx.role || ctx.classe || ctx.nom) {
      contextPrefix = `[CONTEXTE: `;
      if (ctx.nom) contextPrefix += `Utilisateur: ${ctx.nom}. `;
      if (ctx.role === 'teacher' || ctx.role === 'indep_teacher') {
        contextPrefix += `Professeur${ctx.matiere ? ' de ' + ctx.matiere : ''}. `;
      } else if (ctx.role === 'student' || ctx.role === 'indep_student') {
        contextPrefix += `Élève${ctx.classe ? ' de ' + ctx.classe : ''}${ctx.serie ? ' série ' + ctx.serie : ''}. `;
      } else if (ctx.role === 'parent') {
        contextPrefix += `Parent d'élève. `;
      }
      contextPrefix += `] `;
    }
    
    const fullPrompt = contextPrefix + prompt;
    
    const payload = {
      agent_id: AGENT_ID,
      inputs: [
        { role: 'user', content: fullPrompt }
      ]
    };
    
    console.log('Envoi à Mistral:', JSON.stringify(payload));
    
    const response = await fetch(CONVERSATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Mistral Conversations response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral Conversations API error:', response.status, errorText);
      return res.json({ answer: getFallbackResponse(prompt), fallback: true });
    }
    
    const data = await response.json();
    console.log('Mistral response data:', JSON.stringify(data));
    
    // Extraire la réponse - peut être dans différents formats
    let answer = data.outputs?.[0]?.content || 
                 data.choices?.[0]?.message?.content || 
                 data.response || 
                 data.content ||
                 data.message?.content;
    
    if (!answer || answer.trim() === '') {
      return res.json({ answer: getFallbackResponse(prompt), fallback: true });
    }
    
    // Ajouter encouragement BAC si applicable
    answer = addBacEncouragement(answer, ctx);
    
    console.log('Réponse Mistral OK:', answer.substring(0, 100));
    res.json({ answer });
    
  } catch (e) {
    console.error('Erreur:', e.message);
    res.json({ answer: getFallbackResponse(prompt), fallback: true });
  }
});

// Image - Mistral Conversations avec vision (supporte plusieurs images)
app.post('/api/darx-vision', async (req, res) => {
  const { prompt, imageBase64, additionalImages, userContext } = req.body;
  
  if (!imageBase64) {
    return res.json({ answer: 'Image manquante' });
  }
  
  try {
    // Construire le contenu avec une ou plusieurs images
    const content = [
      { type: 'text', text: prompt || 'Décris cette image et aide-moi à comprendre le contenu éducatif.' },
      { type: 'image_url', image_url: imageBase64 }
    ];
    
    // Ajouter les images supplémentaires si présentes
    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach((img, index) => {
        if (img) {
          content.push({ type: 'image_url', image_url: img });
        }
      });
      console.log(`Total images envoyées: ${1 + additionalImages.filter(i => i).length}`);
    }
    
    const payload = {
      agent_id: AGENT_ID,
      inputs: [
        {
          role: 'user',
          content: content
        }
      ]
    };
    
    const response = await fetch(CONVERSATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Mistral Vision response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral Vision error:', response.status, errorText);
      return res.json({ answer: "Je n'ai pas pu analyser l'image. Essaie de décrire ton problème en texte." });
    }
    
    const data = await response.json();
    let answer = data.outputs?.[0]?.content || 
                 data.choices?.[0]?.message?.content || 
                 data.response;
    
    // Ajouter encouragement BAC si applicable
    if (userContext) {
      answer = addBacEncouragement(answer, userContext);
    }
    
    res.json({ answer: answer || "Je n'ai pas pu analyser cette image." });
    
  } catch (e) {
    console.error('Vision error:', e.message);
    res.json({ answer: "Désolé, je n'ai pas pu analyser l'image. Essaie de décrire ton problème en texte." });
  }
});

// Endpoint pour générer un message de bienvenue personnalisé
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
  } 
  else if (role === 'student' || role === 'indep_student') {
    const classeDisplay = classe || niveau || '';
    const serieDisplay = serie ? ` série ${serie}` : '';
    
    message = `Salut **${userName}** ! 👋\n\n`;
    
    if (classeDisplay.includes('Terminale') || classeDisplay.includes('12')) {
      message += `Prêt pour tes révisions du **BAC** en ${classeDisplay}${serieDisplay} ? 🎓\n\n`;
      message += `Je suis **Darx**, ton coach de révision ! Envoie-moi :\n`;
      message += `- 📸 Une photo de ton exercice\n`;
      message += `- ❓ Ta question en maths, physique, français...\n`;
      message += `- 📝 Un sujet type BAC à réviser\n\n`;
      message += `Ensemble, on décroche ce BAC ! 💪`;
    } else {
      message += `Prêt pour tes révisions${classeDisplay ? ` en **${classeDisplay}**` : ''} ? 📚\n\n`;
      message += `Je suis **Darx**, ton assistant personnel ! Pose-moi ta question ou envoie-moi une photo de ton exercice, on va bosser ça ensemble ! 🚀`;
    }
  }
  else if (role === 'parent') {
    message = `Bonjour **${userName}** ! 👋\n\nJe suis **Darx**, l'assistant IA de Neoclass.\n\nJe peux vous aider à :\n- 📊 Comprendre les progrès de votre enfant\n- 💡 Trouver des conseils pour l'accompagner\n- ❓ Répondre à vos questions sur le programme\n\nComment puis-je vous aider ?`;
  }
  else if (role === 'school') {
    message = `Bonjour et bienvenue sur Neoclass ! 🏫\n\nJe suis **Darx**, l'assistant IA de la plateforme.\n\nJe peux vous aider avec la gestion de votre établissement et répondre à vos questions. Comment puis-je vous assister ?`;
  }
  else {
    message = `Bonjour ! Je suis **Darx**, l'assistant IA intelligent de Neoclass. 🤖\n\nJe suis là pour t'aider dans tes études. Pose-moi une question ou envoie-moi une photo d'exercice !`;
  }
  
  res.json({ message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Darx AI server running on http://localhost:${PORT} (Mistral Conversations API)`));
