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

    const prompt = body.prompt;
    const userContext = body.userContext || {};

    if (!prompt) {

      return {
        statusCode: 400,
        body: JSON.stringify({
          answer: "Question vide."
        })
      };
    }

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.MISTRAL_API_KEY}`
        },

        body: JSON.stringify({

          model: "mistral-small",

          messages: [

            {
              role: "system",

              content:
                `Tu es ${APP_CONFIG.NOM_IA},
                une IA éducative du système
                ${APP_CONFIG.SYSTEME}.`
            },

            {
              role: "user",
              content: prompt
            }

          ]
        })
      }
    );

    const data = await response.json();

    let answer =
      data.choices?.[0]?.message?.content ||
      "Pas de réponse.";

    answer =
      addBacEncouragement(
        answer,
        userContext
      );

    return {

      statusCode: 200,

      body: JSON.stringify({
        answer
      })

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