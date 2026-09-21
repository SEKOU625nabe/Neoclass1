/**
 * 🔐 NETLIFY FUNCTION: MISTRAL API PROXY
 * 
 * 📍 Path: netlify/functions/mistral-api.js
 * 
 * Fonction: Proxy serveur pour les appels Mistral AI
 * Avantage: Cache la clé API (pas exposée au client)
 * 
 * Utilisation:
 * ──────────
 * fetch('/.netlify/functions/mistral-api', {
 *   method: 'POST',
 *   body: JSON.stringify({...})
 * })
 */

const fetch = require('node-fetch');

/**
 * Requête valide?
 */
function validateRequest(body) {
  if (!body) return false;
  if (typeof body !== 'object') return false;
  return true;
}

/**
 * Handler Netlify Function
 */
exports.handler = async (event, context) => {
  // Accepter seulement POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parser le body
    const payload = JSON.parse(event.body);

    // Valider
    if (!validateRequest(payload)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    // Préparer clé API (support VITE_ et variable classique)
    const API_KEY = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

    // Appeler l'agent Mistral (format conversations)
    // Utiliser un shape tolerant: content peut être un texte simple ou un tableau d'objets
    const agentBody = {
      agent_id: "ag_019e93673fb171c889fb4c2c6bd32176",
      agent_version: 0,
      inputs: [
        // Mistral accepte souvent {type:'text', text: '...'} — utiliser cette forme pour plus de compatibilité
        { role: 'user', content: [{ type: 'text', text: String(payload.prompt || '') }] }
      ]
    };

    const response = await fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(agentBody)
    });

    const data = await response.json();

    // Essayer d'extraire le texte principal de la réponse (tolérant à plusieurs formats)
    let answer = null;
    try {
      const out0 = data?.outputs?.[0];
      if (out0) {
        const content = out0.content;
        if (typeof content === 'string') {
          answer = content;
        } else if (Array.isArray(content)) {
          // Chercher un champ text si présent, sinon joindre les morceaux
          const firstText = content.find(c => c && (c.text || c.content || c.type === 'text'));
          if (firstText) answer = firstText.text || firstText.content || JSON.stringify(firstText);
          else answer = content.map(c => (typeof c === 'string' ? c : JSON.stringify(c))).join('\n');
        } else if (typeof content === 'object' && content !== null) {
          // objet: tenter champs usuels
          answer = content.text || content.content || JSON.stringify(content);
        }
      }
      // fallbacks
      answer = answer || data?.output || data?.answer || data?.response || null;
    } catch (e) {
      answer = null;
    }

    const result = {
      raw: data,
      answer: answer || JSON.stringify(data)
    };

    return {
      statusCode: response.status || 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };

  } catch (error) {
    console.error('Mistral API Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

/**
 * UTILISATION DANS NEOCLASS3.HTML
 * ═══════════════════════════════════
 * 
 * // Avant (❌ API key exposée):
 * const response = await fetch('https://api.mistral.ai/v1/conversations', {
 *   headers: {
 *     'Authorization': 'Bearer ' + EXPOSED_API_KEY
 *   }
 * });
 * 
 * // Après (✅ Sécurisé via proxy):
 * const response = await fetch('/.netlify/functions/mistral-api', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({...})
 * });
 * 
 */
