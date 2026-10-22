let conversationHistory = [];

const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const welcomeScreen = document.getElementById('welcomeScreen');
const keyModal = document.getElementById('keyModal');
const apiKeyInput = document.getElementById('apiKeyInput');

// Auto resize textarea
userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

// Modal handling
function openKeyModal() {
  apiKeyInput.value = localStorage.getItem('rivanshhai_gemini_key') || '';
  keyModal.style.display = 'flex';
}

function closeKeyModal() {
  keyModal.style.display = 'none';
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('rivanshhai_gemini_key', key);
    closeKeyModal();
    alert("API Key saved successfully!");
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  const apiKey = localStorage.getItem('rivanshhai_gemini_key');
  if (!apiKey) {
    openKeyModal();
    return;
  }

  if (welcomeScreen) welcomeScreen.style.display = 'none';

  // Render user prompt
  appendMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';

  // Loading state
  const botMessageElement = appendMessage('model', 'Rivanshhai soch raha hai...');

  // Build Multi-turn Chat payload
  const contents = [
    ...conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: text }] }
  ];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: "Aapka naam Rivanshhai hai. Aap ChatGPT aur Gemini ki tarah ek extremely smart, helpful aur respectful AI assistant hain. Har sawal ka clear, detailed aur formatted javab dein." }]
        }
      })
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf kijiye, main jawab nahi generate kar paya.";

    botMessageElement.querySelector('.content').innerHTML = marked.parse(reply);
    hljs.highlightAll();

    // Context memory update
    conversationHistory.push({ role: 'user', text: text });
    conversationHistory.push({ role: 'model', text: reply });

  } catch (err) {
    botMessageElement.querySelector('.content').innerText = "Error: " + err.message;
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(role, text) {
  const row = document.createElement('div');
  row.className = `message-row ${role === 'user' ? 'user-row' : 'bot-row'}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerText = role === 'user' ? 'U' : 'R';

  const content = document.createElement('div');
  content.className = 'content';
  content.innerHTML = role === 'user' ? text : marked.parse(text);

  row.appendChild(avatar);
  row.appendChild(content);
  messagesContainer.appendChild(row);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return row;
}

function startNewChat() {
  conversationHistory = [];
  messagesContainer.innerHTML = `
    <div class="welcome-screen" id="welcomeScreen">
      <h1>Main <span>Rivanshhai</span> hoon.</h1>
      <p>ChatGPT aur Gemini jaisa aapka personal AI assistant. Puchhiye kuch bhi!</p>
    </div>
  `;
      }
