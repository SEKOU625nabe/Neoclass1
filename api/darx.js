// ============================================================
// 🤖 DARX — Proxy IA (format Vercel Serverless Function)
// ------------------------------------------------------------
// Équivalent de netlify/functions/darx.js.
// La clé Mistral reste côté serveur : elle n'est jamais exposée
// au navigateur.
//
// Variable d'environnement requise (Vercel → Settings →
// Environment Variables) : MISTRAL_API_KEY
// Optionnelle : MISTRAL_AGENT_ID
// ============================================================

const DEFAULT_AGENT_ID = 'ag_019e93673fb171c889fb4c2c6bd32176';
const MAX_PROMPT_LENGTH = 4000;

const ENCOURAGEMENTS_BAC = [
  "Courage, le chemin vers l'université commence ici ! 🎓",
  'Chaque effort te rapproche du succès au BAC ! 💪',
  'Tu es sur la bonne voie, futur bachelier ! 🌟'
];

function addBacEncouragement(answer, userContext) {
  if (!userContext) return answer;
  const { classe, role } = userContext;
  const isStudent = role === 'student' || role === 'eleve';
  const isFinalYear = classe && (classe.includes('Terminale') || classe.includes('12'));

  if (isStudent && isFinalYear && Math.random() < 0.3) {
    const msg = ENCOURAGEMENTS_BAC[Math.floor(Math.random() * ENCOURAGEMENTS_BAC.length)];
    return answer + '\n\n💪 ' + msg;
  }
  return answer;
}

// Le corps arrive déjà parsé quand Content-Type est application/json,
// mais on tolère une chaîne brute pour rester compatible avec les
// anciens appels.
function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ answer: 'Méthode non autorisée.' });
  }

  try {
    const body = readBody(req);

    // Le front utilise `prompt` à certains endroits et `message` à
    // d'autres : on accepte les deux pour qu'aucun appel ne parte vide.
    const prompt = String(body.prompt || body.message || '').trim();
    const userContext = (body.userContext && typeof body.userContext === 'object') ? body.userContext : {};

    if (!prompt) {
      return res.status(400).json({ answer: 'Question vide.' });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({ answer: 'Question trop longue. Réduis la taille de ta demande.' });
    }

    const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      console.error('[darx] MISTRAL_API_KEY absente des variables d\'environnement.');
      return res.status(503).json({ answer: "Darx n'est pas configuré sur ce serveur." });
    }

    const response = await fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        agent_id: process.env.MISTRAL_AGENT_ID || DEFAULT_AGENT_ID,
        agent_version: 0,
        inputs: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[darx] Mistral a répondu', response.status, detail.slice(0, 500));
      return res.status(502).json({ answer: 'Darx est momentanément indisponible. Réessaie dans un instant.' });
    }

    const data = await response.json();
    let answer = data?.outputs?.[0]?.content?.[0]?.text || data?.answer || 'Pas de réponse.';
    answer = addBacEncouragement(answer, userContext);

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('[darx] Erreur inattendue :', error);
    return res.status(500).json({ answer: 'Darx a rencontré une erreur. Réessaie plus tard.' });
  }
};
