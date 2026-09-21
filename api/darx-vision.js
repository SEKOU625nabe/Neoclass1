// ============================================================
// 👁️ DARX VISION — Analyse d'image (format Vercel Serverless)
// ------------------------------------------------------------
// Le front appelait /.netlify/functions/darx-vision, mais cette
// fonction n'a jamais existé côté Netlify : l'analyse d'image
// échouait donc systématiquement. Elle est implémentée ici.
//
// Variable d'environnement requise : MISTRAL_API_KEY
// Modèle : pixtral-12b-2409 (multimodal Mistral)
// ============================================================

const VISION_MODEL = process.env.MISTRAL_VISION_MODEL || 'pixtral-12b-2409';
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6 Mo de base64

const DEFAULT_PROMPT =
  "Analyse cette image d'exercice scolaire. Explique l'énoncé, puis donne la démarche " +
  "de résolution étape par étape, en français, de manière claire et pédagogique.";

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

// Le front envoie soit une data-URI complète, soit du base64 nu.
function toDataUri(image) {
  const raw = String(image || '').trim();
  if (!raw) return null;
  if (raw.startsWith('data:image/')) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ answer: 'Méthode non autorisée.' });
  }

  try {
    const body = readBody(req);
    const imageUri = toDataUri(body.imageBase64 || body.image);

    if (!imageUri) {
      return res.status(400).json({ answer: 'Aucune image reçue.' });
    }
    if (imageUri.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ answer: 'Image trop lourde. Réduis sa taille et réessaie.' });
    }

    const prompt = String(body.prompt || '').trim() || DEFAULT_PROMPT;

    const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      console.error('[darx-vision] MISTRAL_API_KEY absente des variables d\'environnement.');
      return res.status(503).json({ answer: "L'analyse d'image n'est pas configurée sur ce serveur." });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: imageUri }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[darx-vision] Mistral a répondu', response.status, detail.slice(0, 500));
      return res.status(502).json({ answer: "Darx n'a pas pu analyser l'image. Réessaie dans un instant." });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "Je n'ai pas pu analyser cette image.";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('[darx-vision] Erreur inattendue :', error);
    return res.status(500).json({ answer: "L'analyse d'image a échoué. Réessaie plus tard." });
  }
};
