// 🤖 Mistral AI Service pour Neoclass
// Connexion au serveur local LM Studio

class MistralAI {
  constructor(apiUrl = 'http://127.0.0.1:1234/v1') {
    this.apiUrl = apiUrl;
    this.modelId = 'mistral-7b-instruct-v0.1';
    this.conversationHistory = [];
    this.isLoading = false;
  }

  // Vérifier si le serveur est actif
  async isServerActive() {
    try {
      const response = await fetch(`${this.apiUrl}/models`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (e) {
      console.log('Mistral serveur indisponible:', e.message);
      return false;
    }
  }

  // Envoyer un message à Mistral
  async sendMessage(userMessage, context = {}) {
    if (this.isLoading) {
      return {
        success: false,
        message: 'Une réponse est déjà en cours...'
      };
    }

    try {
      this.isLoading = true;

      // Vérifier le serveur
      const serverActive = await this.isServerActive();
      if (!serverActive) {
        throw new Error('Serveur Mistral indisponible. Vérifiez LM Studio.');
      }

      // Ajouter à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Préparer le prompt avec contexte
      const systemPrompt = this.buildSystemPrompt(context);

      // Appel API avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory.slice(-10) // Garder les 10 derniers messages
          ],
          temperature: 0.7,
          max_tokens: 512,
          top_p: 0.9,
          top_k: 40
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return {
        success: true,
        message: assistantMessage,
        tokens: data.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('Erreur Mistral:', error);
      
      let errorMessage = 'Erreur de connexion à Mistral';
      if (error.name === 'AbortError') {
        errorMessage = 'Délai d\'attente dépassé (30s). Vérifiez votre connexion.';
      } else if (error.message.includes('indisponible')) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    } finally {
      this.isLoading = false;
    }
  }

  // Construire le prompt système selon le contexte
  buildSystemPrompt(context = {}) {
    const { role, language = 'fr', subject = '' } = context;
    
    const subjectInfo = subject ? ` sujet: ${subject}` : '';

    const prompts = {
      tutor: `Tu es un tuteur éducatif pour la plateforme Neoclass.${subjectInfo}
Tu aides les étudiants à comprendre les concepts.
Réponds de manière pédagogique et encourageante.
Utilise des exemples concrets si possible.
Sois clair et pas trop long.
Langue: ${language === 'fr' ? 'Français' : language === 'en' ? 'English' : 'العربية'}`,

      assistant: `Tu es un assistant IA pour la plateforme éducative Neoclass.
Tu aides avec des questions générales.
Sois concis et utile.
Réponds en ${language === 'fr' ? 'français' : language === 'en' ? 'anglais' : 'arabe'}.`,

      qacorrector: `Tu es un correcteur d'exercices pour Neoclass.
Évalue les réponses de l'étudiant.
Donne des feedbacks constructifs et encourageants.
Utilise un ton bienveillant.
Langue: ${language === 'fr' ? 'Français' : 'English'}`,

      default: `Tu es un assistant IA pour la plateforme Neoclass.
Sois utile, honnête et concis.
Langue: ${language === 'fr' ? 'Français' : language === 'en' ? 'English' : 'العربية'}`
    };

    return prompts[role] || prompts.default;
  }

  // Correction d'exercice
  async correctExercise(studentAnswer, correctAnswer, exercise = {}) {
    const message = `
Exercice: "${exercise.title || 'Exercice'}"
Réponse de l'étudiant: "${studentAnswer}"
Réponse correcte: "${correctAnswer}"

Évalue cette réponse sur 100 et donne un feedback constructif.
Réponds en JSON: {"score": XX, "feedback": "...", "suggestion": "..."}
    `;

    const result = await this.sendMessage(message, { role: 'qacorrector' });
    
    if (!result.success) return result;

    try {
      const parsed = JSON.parse(result.message);
      return { success: true, ...parsed };
    } catch {
      return { 
        success: false, 
        message: 'Erreur de parsing de la réponse'
      };
    }
  }

  // Chat tutoriel
  async tutorChat(studentQuestion, subject = '') {
    return await this.sendMessage(studentQuestion, { 
      role: 'tutor',
      subject: subject
    });
  }

  // Générer des questions de quiz
  async generateQuizQuestions(topic, count = 5, difficulty = 'moyen') {
    const message = `
Génère ${count} questions de quiz sur: "${topic}" (difficulté: ${difficulty})
Réponds en JSON valide:
[
  {
    "question": "...",
    "options": ["option1", "option2", "option3", "option4"],
    "answer": 0,
    "explanation": "..."
  }
]
    `;

    const result = await this.sendMessage(message);
    
    if (!result.success) return result;

    try {
      const questions = JSON.parse(result.message);
      return { success: true, questions };
    } catch {
      return { 
        success: false, 
        message: 'Impossible de générer le quiz'
      };
    }
  }

  // Résumer un texte
  async summarizeText(text, length = 'moyen') {
    const messages = {
      court: '50 mots max',
      moyen: '100-150 mots',
      long: '200-300 mots'
    };

    const message = `
Résume ce texte en ${messages[length] || messages.moyen}:

"${text}"

Donne uniquement le résumé, pas de preamble.
    `;

    return await this.sendMessage(message);
  }

  // Expliquer un concept
  async explainConcept(concept, level = 'beginner') {
    const levels = {
      beginner: 'simple et accessible',
      intermediate: 'moyen',
      advanced: 'technique et détaillé'
    };

    const message = `
Explique le concept de: "${concept}"
Niveau: ${levels[level] || levels.beginner}
Utilise des exemples si possible.
Reste concis (moins de 300 mots).
    `;

    return await this.sendMessage(message);
  }

  // Générer un exercice
  async generateExercise(topic, difficulty = 'moyen') {
    const message = `
Crée un exercice sur: "${topic}" (difficulté: ${difficulty})
Inclus:
- Énoncé du problème
- Indice utile
- Réponse attendue avec explication

Format JSON: {"problem": "...", "hint": "...", "answer": "...", "explanation": "..."}
    `;

    const result = await this.sendMessage(message);
    
    if (!result.success) return result;

    try {
      const exercise = JSON.parse(result.message);
      return { success: true, ...exercise };
    } catch {
      return { success: false, message: 'Erreur génération exercice' };
    }
  }

  // Effacer historique
  clearHistory() {
    this.conversationHistory = [];
  }

  // Obtenir historique
  getHistory() {
    return this.conversationHistory;
  }

  // Obtenir stats
  getStats() {
    return {
      messagesCount: this.conversationHistory.length,
      isLoading: this.isLoading,
      url: this.apiUrl
    };
  }
}

// Export global
window.MistralAI = MistralAI;
if (!window.mistral) {
  window.mistral = new MistralAI();
}
