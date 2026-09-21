// 💬 Interface Chat Mistral pour Neoclass

async function renderAIChatPage() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  const html = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <!-- Navbar -->
      <div class="navbar">
        <h1>💬 Assistant IA</h1>
        <button class="btn btn-secondary" onclick="goBack()" style="padding: 8px 15px;">← Retour</button>
      </div>

      <!-- Container principal -->
      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        
        <!-- Messages area -->
        <div id="aiChatMessages" style="
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg);
          -webkit-overflow-scrolling: touch;
        "></div>

        <!-- Status Serveur -->
        <div id="serverStatus" style="
          padding: 10px 15px;
          text-align: center;
          font-size: 0.85rem;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        ">
          <span id="serverStatusIcon">🔄</span> Vérification du serveur...
        </div>

        <!-- Input area -->
        <div style="
          padding: 15px;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
        ">
          <form id="aiChatForm" onsubmit="handleAIChatSubmit(event)" style="display: flex; gap: 8px;">
            <input
              type="text"
              id="aiMessageInput"
              placeholder="Posez une question à l'IA..."
              class="form-input"
              style="flex: 1; margin: 0;"
              autocomplete="off"
            />
            <button type="submit" class="btn btn-primary" style="padding: 12px 15px; white-space: nowrap;">
              Envoyer
            </button>
          </form>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; text-align: center;">
            Powered by Mistral AI
          </div>
        </div>
      </div>
    </div>
  `;

  dashboardContent.innerHTML = html;

  // Ajouter un message de bienvenue
  setTimeout(() => {
    addAIChatMessage(
      'Bonjour! 👋 Je suis votre assistant IA. Je peux vous aider avec vos études. Posez-moi une question!',
      'assistant'
    );

    // Vérifier le serveur
    checkServerStatus();
  }, 100);

  setupAIChatListeners();
}

async function checkServerStatus() {
  const statusIcon = document.getElementById('serverStatusIcon');
  const statusText = document.getElementById('serverStatus');

  const isActive = await window.mistral.isServerActive();

  if (isActive) {
    statusIcon.textContent = '✓';
    statusText.innerHTML = '✓ <strong>Serveur Mistral actif</strong> - Prêt à discuter!';
    statusText.style.background = 'rgba(16, 185, 129, 0.1)';
    statusText.style.color = 'var(--success)';
  } else {
    statusIcon.textContent = '✗';
    statusText.innerHTML = `
      ✗ <strong>Serveur Mistral indisponible</strong><br>
      <small>Assurez-vous que LM Studio est lancé (http://127.0.0.1:1234)</small>
    `;
    statusText.style.background = 'rgba(239, 68, 68, 0.1)';
    statusText.style.color = 'var(--danger)';
  }
}

async function handleAIChatSubmit(event) {
  event.preventDefault();

  const input = document.getElementById('aiMessageInput');
  const message = input.value.trim();

  if (!message) return;

  // Afficher le message utilisateur
  addAIChatMessage(message, 'user');
  input.value = '';
  input.focus();

  // Afficher "en cours de réflexion..."
  const thinkingId = 'thinking_' + Date.now();
  addAIChatMessage('🤔 En cours de réflexion...', 'thinking', thinkingId);

  // Désactiver le form
  document.getElementById('aiChatForm').style.opacity = '0.6';
  document.getElementById('aiChatForm').style.pointerEvents = 'none';

  // Appeler Mistral
  const result = await window.mistral.sendMessage(message);

  // Supprimer "en cours..."
  const thinkingEl = document.getElementById(thinkingId);
  if (thinkingEl) thinkingEl.remove();

  // Réactiver le form
  document.getElementById('aiChatForm').style.opacity = '1';
  document.getElementById('aiChatForm').style.pointerEvents = 'auto';

  if (result.success) {
    addAIChatMessage(result.message, 'assistant');
  } else {
    addAIChatMessage('❌ Erreur: ' + result.message, 'error');
    showToast(result.message, 'error', 5000);
  }
}

function addAIChatMessage(text, role = 'assistant', id = null) {
  const messagesDiv = document.getElementById('aiChatMessages');
  
  const messageEl = document.createElement('div');
  messageEl.id = id;
  
  let alignment = 'flex-start';
  let bgColor = 'var(--bg-card)';
  let textColor = 'var(--text)';
  let borderRadius = '10px 10px 0px 10px';
  let maxWidth = '85%';

  if (role === 'user') {
    alignment = 'flex-end';
    bgColor = 'var(--primary)';
    textColor = 'white';
    borderRadius = '10px 10px 10px 0px';
  } else if (role === 'error') {
    bgColor = 'rgba(239, 68, 68, 0.15)';
    textColor = 'var(--danger)';
  } else if (role === 'thinking') {
    bgColor = 'rgba(108, 99, 255, 0.1)';
    textColor = 'var(--primary)';
  }

  messageEl.innerHTML = `
    <div style="
      display: flex;
      justify-content: ${alignment};
      width: 100%;
      margin-bottom: 5px;
    ">
      <div style="
        max-width: ${maxWidth};
        padding: 10px 14px;
        border-radius: ${borderRadius};
        background: ${bgColor};
        color: ${textColor};
        word-wrap: break-word;
        line-height: 1.5;
        font-size: 0.95rem;
      ">
        ${escapeHtml(text)}
      </div>
    </div>
  `;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function setupAIChatListeners() {
  const input = document.getElementById('aiMessageInput');
  
  // Focus automatique
  input.focus();

  // Shortcuts
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('aiChatForm').dispatchEvent(new Event('submit'));
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// PAGE D'ASSISTANCE TUTEUR
// ============================================

async function renderTutorPage() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  const html = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div class="navbar">
        <h1>🎓 Tuteur IA</h1>
        <button class="btn btn-secondary" onclick="goBack()" style="padding: 8px 15px;">← Retour</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 15px;">
        <div class="card">
          <h2 style="margin-bottom: 15px;">Sujets disponibles</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="btn btn-primary" onclick="startTutorChat('Mathématiques')">🧮 Maths</button>
            <button class="btn btn-primary" onclick="startTutorChat('Français')">📚 Français</button>
            <button class="btn btn-primary" onclick="startTutorChat('Sciences')">🔬 Sciences</button>
            <button class="btn btn-primary" onclick="startTutorChat('Histoire')">🏛️ Histoire</button>
            <button class="btn btn-primary" onclick="startTutorChat('Anglais')">🌐 Anglais</button>
            <button class="btn btn-primary" onclick="startTutorChat('Informatique')">💻 Info</button>
          </div>
        </div>

        <div class="card" style="margin-top: 15px;">
          <h3 style="margin-bottom: 10px;">Ou posez votre question directement:</h3>
          <form onsubmit="handleTutorQuestion(event)">
            <div class="form-group">
              <textarea 
                id="tutorQuestion"
                placeholder="Décrivez votre question ou sujet..."
                class="form-input"
                style="height: 80px; resize: vertical;"
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Demander au tuteur</button>
          </form>
        </div>
      </div>
    </div>
  `;

  dashboardContent.innerHTML = html;
}

async function startTutorChat(subject) {
  const dashboardContent = document.getElementById('dashboardContent');
  
  const html = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div class="navbar">
        <h1>🎓 Tuteur: ${subject}</h1>
        <button class="btn btn-secondary" onclick="renderTutorPage()" style="padding: 8px 15px;">← Retour</button>
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <div id="tutorMessages" style="
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg);
        "></div>

        <div style="padding: 15px; background: var(--bg-card); border-top: 1px solid var(--border);">
          <form id="tutorForm" onsubmit="handleTutorMessage(event, '${subject}')" style="display: flex; gap: 8px;">
            <input
              type="text"
              id="tutorInput"
              placeholder="Posez une question sur ${subject}..."
              class="form-input"
              style="flex: 1; margin: 0;"
              autocomplete="off"
            />
            <button type="submit" class="btn btn-primary" style="padding: 12px 15px;">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  `;

  dashboardContent.innerHTML = html;

  const messagesDiv = document.getElementById('tutorMessages');
  const greetingMsg = `Bonjour! 👋 Je suis votre tuteur de ${subject}. Posez-moi vos questions et je vous aiderai!`;
  
  const msgEl = document.createElement('div');
  msgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text);
      ">${greetingMsg}</div>
    </div>
  `;
  messagesDiv.appendChild(msgEl);

  document.getElementById('tutorInput').focus();
}

async function handleTutorMessage(event, subject) {
  event.preventDefault();

  const input = document.getElementById('tutorInput');
  const message = input.value.trim();

  if (!message) return;

  const messagesDiv = document.getElementById('tutorMessages');

  // Afficher le message utilisateur
  const userMsgEl = document.createElement('div');
  userMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-end; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--primary);
        color: white;
      ">${escapeHtml(message)}</div>
    </div>
  `;
  messagesDiv.appendChild(userMsgEl);
  input.value = '';

  // Message "en cours"
  const thinkingEl = document.createElement('div');
  thinkingEl.id = 'thinking_tutor';
  thinkingEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(108, 99, 255, 0.1);
      ">🤔 Le tuteur réfléchit...</div>
    </div>
  `;
  messagesDiv.appendChild(thinkingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Appel Mistral
  const result = await window.mistral.tutorChat(message, subject);
  
  document.getElementById('thinking_tutor')?.remove();

  // Réponse
  const aiMsgEl = document.createElement('div');
  aiMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text);
        line-height: 1.5;
      ">${escapeHtml(result.message)}</div>
    </div>
  `;
  messagesDiv.appendChild(aiMsgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  document.getElementById('tutorInput').focus();
}

async function handleTutorQuestion(event) {
  event.preventDefault();
  
  const question = document.getElementById('tutorQuestion').value.trim();
  if (!question) return;

  // Lancer le chat avec question personnalisée
  const dashboardContent = document.getElementById('dashboardContent');
  
  const html = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div class="navbar">
        <h1>🎓 Tuteur IA</h1>
        <button class="btn btn-secondary" onclick="renderTutorPage()" style="padding: 8px 15px;">← Retour</button>
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <div id="tutorMessages2" style="
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg);
        "></div>

        <div style="padding: 15px; background: var(--bg-card); border-top: 1px solid var(--border);">
          <form id="tutorForm2" onsubmit="handleTutorMessage2(event)" style="display: flex; gap: 8px;">
            <input
              type="text"
              id="tutorInput2"
              placeholder="Posez une autre question..."
              class="form-input"
              style="flex: 1; margin: 0;"
              autocomplete="off"
            />
            <button type="submit" class="btn btn-primary" style="padding: 12px 15px;">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  `;

  dashboardContent.innerHTML = html;

  const messagesDiv = document.getElementById('tutorMessages2');

  // Afficher la question
  const userMsgEl = document.createElement('div');
  userMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-end; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--primary);
        color: white;
      ">${escapeHtml(question)}</div>
    </div>
  `;
  messagesDiv.appendChild(userMsgEl);

  // En cours
  const thinkingEl = document.createElement('div');
  thinkingEl.id = 'thinking_tutor2';
  thinkingEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(108, 99, 255, 0.1);
      ">🤔 Le tuteur réfléchit à votre question...</div>
    </div>
  `;
  messagesDiv.appendChild(thinkingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Appel
  const result = await window.mistral.tutorChat(question);
  
  document.getElementById('thinking_tutor2')?.remove();

  // Réponse
  const aiMsgEl = document.createElement('div');
  aiMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text);
        line-height: 1.5;
      ">${escapeHtml(result.message)}</div>
    </div>
  `;
  messagesDiv.appendChild(aiMsgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  document.getElementById('tutorInput2').focus();
}

async function handleTutorMessage2(event) {
  event.preventDefault();

  const input = document.getElementById('tutorInput2');
  const message = input.value.trim();

  if (!message) return;

  const messagesDiv = document.getElementById('tutorMessages2');

  // Message utilisateur
  const userMsgEl = document.createElement('div');
  userMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-end; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--primary);
        color: white;
      ">${escapeHtml(message)}</div>
    </div>
  `;
  messagesDiv.appendChild(userMsgEl);
  input.value = '';

  // En cours
  const thinkingEl = document.createElement('div');
  thinkingEl.id = 'thinking_tutor3';
  thinkingEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(108, 99, 255, 0.1);
      ">🤔 Le tuteur réfléchit...</div>
    </div>
  `;
  messagesDiv.appendChild(thinkingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Appel
  const result = await window.mistral.tutorChat(message);
  
  document.getElementById('thinking_tutor3')?.remove();

  // Réponse
  const aiMsgEl = document.createElement('div');
  aiMsgEl.innerHTML = `
    <div style="display: flex; justify-content: flex-start; width: 100%;">
      <div style="
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text);
        line-height: 1.5;
      ">${escapeHtml(result.message)}</div>
    </div>
  `;
  messagesDiv.appendChild(aiMsgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  input.focus();
}

// Exports
window.renderAIChatPage = renderAIChatPage;
window.renderTutorPage = renderTutorPage;
window.startTutorChat = startTutorChat;
window.handleAIChatSubmit = handleAIChatSubmit;
window.handleTutorQuestion = handleTutorQuestion;
window.checkServerStatus = checkServerStatus;
