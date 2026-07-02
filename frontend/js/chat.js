document.addEventListener('DOMContentLoaded', () => {
  const chatBtn = document.getElementById('chat-toggle-btn');
  const chatWindow = document.getElementById('chat-window');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatSendBtn = document.getElementById('chat-send-btn');

  if (!chatBtn || !chatWindow) return;

  let messages = [
    { role: "bot", content: "Hi! I'm Malik's AI assistant. How can I help you today?" }
  ];
  let loading = false;

  function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML to prevent XSS
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks (```lang ... ```)
    html = html.replace(/```(?:\w+)?\n([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.3); padding: 0.6rem; border-radius: 6px; overflow-x: auto; margin: 0.5rem 0; font-family: monospace; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1); white-space: pre;"><code>$1</code></pre>');

    // Inline code (`code`)
    html = html.replace(/`([^`\n]+)`/g, '<code style="background: rgba(0,0,0,0.25); padding: 0.15rem 0.3rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: #ff79c6;">$1</code>');

    // Bold (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italics (*text*)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet points: lines starting with * or - followed by a space
    html = html.split('\n').map(line => {
      const bulletMatch = line.match(/^\s*[\*\-]\s+(.+)$/);
      if (bulletMatch) {
        return `<li style="margin-left: 1rem; margin-bottom: 0.25rem; list-style-type: disc;">${bulletMatch[1]}</li>`;
      }
      return line;
    }).join('\n');

    // Newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function renderMessages() {
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = msg.role === 'user' ? 'flex-end' : 'flex-start';
      div.style.marginBottom = '1rem';
      
      const content = document.createElement('div');
      content.style.maxWidth = '85%';
      content.style.padding = '0.8rem';
      content.style.fontSize = '0.9rem';
      content.style.borderRadius = '12px';
      
      if (msg.role === 'user') {
        content.style.backgroundColor = 'var(--accent-teal)';
        content.style.color = 'var(--white)';
        content.style.borderTopRightRadius = '2px';
        content.textContent = msg.content;
      } else {
        content.style.backgroundColor = 'rgba(255,255,255,0.05)';
        content.style.color = 'var(--white)';
        content.style.borderTopLeftRadius = '2px';
        content.style.border = '1px solid var(--glass-border)';
        content.style.whiteSpace = 'normal';
        content.innerHTML = parseMarkdown(msg.content);
      }
      
      div.appendChild(content);
      chatMessages.appendChild(div);
    });

    if (loading) {
      const loaderDiv = document.createElement('div');
      loaderDiv.style.display = 'flex';
      loaderDiv.style.justifyContent = 'flex-start';
      loaderDiv.style.marginBottom = '1rem';
      loaderDiv.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border-radius: 12px; border-top-left-radius: 2px; border: 1px solid var(--glass-border); padding: 0.8rem; font-size: 0.9rem; display: flex; gap: 4px; align-items: center;">
          <span style="width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%;"></span>
          <span style="width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%;"></span>
          <span style="width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%;"></span>
        </div>
      `;
      chatMessages.appendChild(loaderDiv);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatBtn.addEventListener('click', () => {
    chatWindow.classList.add('active');
    chatBtn.style.display = 'none';
    renderMessages();
  });

  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    chatBtn.style.display = 'flex';
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage || loading) return;

    messages.push({ role: 'user', content: userMessage });
    chatInput.value = '';
    loading = true;
    renderMessages();

    try {
      const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1, -1) // exclude first greeting and the latest user message
        })
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        messages.push({ role: 'bot', content: data.reply });
      } else {
        messages.push({ role: 'bot', content: "Sorry, I am having trouble connecting to my brain right now. " + (data.error || "") });
      }
    } catch (error) {
      console.error(error);
      messages.push({ role: 'bot', content: "An error occurred while trying to think." });
    } finally {
      loading = false;
      renderMessages();
    }
  });

  // Initial render for when it opens
  renderMessages();
});
