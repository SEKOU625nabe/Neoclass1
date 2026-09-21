const APP_CONFIG = {
  NOM_IA: "Darx",
  SYSTEME: "Guinéen / Franco-Arabe"
};

const ENCOURAGEMENTS_BAC = [
  "Courage, le chemin vers l'université commence ici ! 🎓",
  "Chaque effort te rapproche du succès au BAC ! 💪",
  "Tu es sur la bonne voie, futur bachelier ! 🌟"
];

function addBacEncouragement(answer, userContext) {

  if (!userContext) return answer;

  const { classe, role } = userContext;

  if (
    (role === "student" || role === "eleve") &&
    classe &&
    (classe.includes("Terminale") || classe.includes("12"))
  ) {

    if (Math.random() < 0.3) {

      const msg =
        ENCOURAGEMENTS_BAC[
          Math.floor(Math.random() * ENCOURAGEMENTS_BAC.length)
        ];

      return answer + "\n\n💪 " + msg;
    }
  }

  return answer;
}

exports.handler = async (event) => {

  try {

    const body = JSON.parse(event.body);

    const prompt = (body.prompt || '').toString().trim();
    const userContext = (body.userContext && typeof body.userContext === 'object') ? body.userContext : {};

    // Validation basique: non vide et taille raisonnable
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          answer: 'Question vide.'
        })
      };
    }

    if (prompt.length > 2000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          answer: 'Question trop longue. Veuillez réduire la taille du prompt.'
        })
      };
    }

    const API_KEY = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

    const agentBody = {
      agent_id: "ag_019e93673fb171c889fb4c2c6bd32176",
      agent_version: 0,
      inputs: [
        { role: 'user', content: prompt }
      ]
    };

    const response = await fetch("https://api.mistral.ai/v1/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(agentBody)
    });

    const data = await response.json();

    let answer = data?.outputs?.[0]?.content?.[0]?.text || data?.answer || "Pas de réponse.";

    answer = addBacEncouragement(answer, userContext);

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (error) {

    return {

      statusCode: 500,

      body: JSON.stringify({
        error: error.message
      })

    };

  }

};