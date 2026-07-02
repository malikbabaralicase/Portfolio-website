const API_BASE = window.location.port === '5000' ? '/api' : 'http://localhost:5000/api';

// Tab Switching
function switchTab(tab) {
  document.getElementById('view-projects').classList.toggle('hidden', tab !== 'projects');
  document.getElementById('view-messages').classList.toggle('hidden', tab !== 'messages');
  
  const tabProjects = document.getElementById('tab-projects');
  const tabMessages = document.getElementById('tab-messages');
  
  if (tab === 'projects') {
    tabProjects.className = 'w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors bg-accent/10 text-accent font-medium';
    tabMessages.className = 'w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors text-white/70 hover:bg-white/5 hover:text-white';
    loadProjects();
  } else {
    tabMessages.className = 'w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors bg-accent/10 text-accent font-medium';
    tabProjects.className = 'w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors text-white/70 hover:bg-white/5 hover:text-white';
    loadMessages();
  }
}

// Projects Logic
let currentProjects = [];

async function loadProjects() {
  const container = document.getElementById('projects-list');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    currentProjects = await res.json();
    
    if (currentProjects.length === 0) {
      container.innerHTML = '<p class="text-white/50 col-span-2">No projects found.</p>';
      return;
    }

    container.innerHTML = currentProjects.map(p => `
      <div class="saas-card p-6 flex flex-col">
        <h3 class="text-xl font-bold text-white mb-2">${p.title}</h3>
        <p class="text-sm text-white/60 mb-4 flex-grow">${p.description.substring(0, 100)}...</p>
        <div class="flex justify-end gap-2 pt-4 border-t border-white/10">
          <button onclick='editProject(${JSON.stringify(p).replace(/'/g, "&apos;")})' class="px-3 py-1.5 bg-white/5 text-white text-sm rounded hover:bg-white/10 transition-colors">Edit</button>
          <button onclick="deleteProject(${p.id})" class="px-3 py-1.5 bg-red-500/10 text-red-400 text-sm rounded hover:bg-red-500/20 transition-colors">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p class="text-red-400">Failed to load projects.</p>';
  }
}

function openProjectModal() {
  document.getElementById('project-form').reset();
  document.getElementById('project-id').value = '';
  document.getElementById('modal-title').textContent = 'Add Project';
  document.getElementById('project-modal').classList.remove('hidden');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

function editProject(project) {
  document.getElementById('project-id').value = project.id;
  document.getElementById('project-title').value = project.title || '';
  document.getElementById('project-desc').value = project.description || '';
  document.getElementById('project-problem').value = project.problem || '';
  document.getElementById('project-solution').value = project.solution || '';
  document.getElementById('project-tech').value = project.tech_stack || '';
  document.getElementById('project-image').value = project.image_url || '';
  document.getElementById('project-live').value = project.live_link || '';
  document.getElementById('project-github').value = project.github_link || '';
  document.getElementById('modal-title').textContent = 'Edit Project';
  document.getElementById('project-modal').classList.remove('hidden');
}

document.getElementById('project-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const data = {
    title: document.getElementById('project-title').value,
    description: document.getElementById('project-desc').value,
    problem: document.getElementById('project-problem').value,
    solution: document.getElementById('project-solution').value,
    tech_stack: document.getElementById('project-tech').value,
    image_url: document.getElementById('project-image').value,
    live_link: document.getElementById('project-live').value,
    github_link: document.getElementById('project-github').value,
  };

  try {
    if (id) {
      await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    closeProjectModal();
    loadProjects();
  } catch (e) {
    alert('Error saving project');
  }
});

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    loadProjects();
  } catch (e) {
    alert('Error deleting project');
  }
}

// Messages Logic
async function loadMessages() {
  const container = document.getElementById('messages-list');
  try {
    const res = await fetch(`${API_BASE}/messages`);
    const messages = await res.json();

    if (messages.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-white/50">No messages found.</td></tr>';
      return;
    }

    container.innerHTML = messages.map(m => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td class="p-4 text-white/70">${new Date(m.created_at).toLocaleDateString()}</td>
        <td class="p-4 font-medium text-white">${m.name}</td>
        <td class="p-4 text-white/70"><a href="mailto:${m.email}" class="text-blue-400 hover:underline">${m.email}</a></td>
        <td class="p-4 text-white/70 max-w-xs truncate" title="${m.message}">${m.message}</td>
        <td class="p-4 text-right">
          <button onclick="deleteMessage(${m.id})" class="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    container.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-400">Failed to load messages.</td></tr>';
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' });
    loadMessages();
  } catch (e) {
    alert('Error deleting message');
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});
