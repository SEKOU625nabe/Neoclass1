// netlify/functions/darx-vision.js
const CONVERSATIONS_API_URL = 'https://api.mistral.ai/v1/agents/completions';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  const AGENT_ID = process.env.MISTRAL_AGENT_ID;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ answer: 'Requête invalide' }) }; }

  const { prompt, imageBase64, additionalImages, userContext } = body;

  if (!imageBase64) {
    return { statusCode: 200, headers, body: JSON.stringify({ answer: 'Image manquante' }) };
  }

  if (!MISTRAL_API_KEY || !AGENT_ID) {
    return { statusCode: 200, headers, body: JSON.stringify({ answer: "Service IA non configuré." }) };
  }

  try {
    const content = [
      { type: 'text', text: prompt || "Décris cette image et aide-moi à comprendre le contenu éducatif." },
      { type: 'image_url', image_url: imageBase64 }
    ];

    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach(img => { if (img) content.push({ type: 'image_url', image_url: img }); });
    }

    const response = await fetch(CONVERSATIONS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MISTRAL_API_KEY}` },
      body: JSON.stringify({ agent_id: AGENT_ID, inputs: [{ role: 'user', content }] })
    });

    if (!response.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ answer: "Je n'ai pas pu analyser l'image. Décris ton problème en texte." }) };
    }

    const data = await response.json();
    const answer = data.outputs?.[0]?.content || data.choices?.[0]?.message?.content || data.response;

    return { statusCode: 200, headers, body: JSON.stringify({ answer: answer || "Impossible d'analyser cette image." }) };

  } catch (e) {
    console.error('Vision error:', e.message);
    return { statusCode: 200, headers, body: JSON.stringify({ answer: "Erreur lors de l'analyse de l'image." }) };
  }
};
