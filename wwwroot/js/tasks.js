const userId = localStorage.getItem('userId');
const token  = localStorage.getItem('token');

if (!token || !userId) window.location.href = '/Account/Login';

document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const firstName = localStorage.getItem('firstName') || '';
const lastName  = localStorage.getItem('lastName') || '';
const email     = localStorage.getItem('email') || '';

document.querySelector('.user-name').textContent  = `${firstName} ${lastName}`;
document.querySelector('.user-email').textContent = email;

const savedAvatar = localStorage.getItem('avatar');
const avatarEl    = document.querySelector('.avatar');

if (savedAvatar) {
  avatarEl.innerHTML = `<img src="${savedAvatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
} else {
  avatarEl.textContent = (firstName[0] || '') + (lastName[0] || '');
}

let currentView     = 'day';
let currentPriority = '';

async function loadTasks() {
  const params = new URLSearchParams({ userId, view: currentView });
  if (currentPriority) params.append('priority', currentPriority);

  try {
    const res   = await fetch(`/api/tasks?${params}`);
    const tasks = await res.json();

    document.getElementById('stat-total').textContent     = tasks.length;
    document.getElementById('stat-high').textContent      = tasks.filter(t => t.priority === 'high').length;
    document.getElementById('stat-done').textContent      = tasks.filter(t => t.done).length;
    document.getElementById('stat-inprogress').textContent = tasks.filter(t => !t.done).length;

    renderTasks(tasks);
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

function renderTasks(tasks) {
  const grid   = document.getElementById('task-grid');
  const search = document.querySelector('.search-input').value.toLowerCase();

  const filtered = tasks.filter(t =>
    !search ||
    t.title?.toLowerCase().includes(search) ||
    t.description?.toLowerCase().includes(search) ||
    t.hashtags?.some(h => h.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted);">
      <p style="font-size:14px;">No tasks found. <a href="/Tasks/Add" style="color:var(--green);">Add one?</a></p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(task => `
    <div class="task-card">
      <div class="task-card-top">
        <span class="task-title ${task.done ? 'done' : ''}">${task.title}</span>
        <div class="task-actions">
          <button class="icon-btn" onclick="editTask(${task.id})"><i class="ti ti-edit"></i></button>
          <button class="icon-btn danger" onclick="deleteTask(${task.id})"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
      <div class="task-meta">
        ${task.priority ? `<span class="badge badge-${task.priority}">${capitalize(task.priority)}</span>` : ''}
        ${task.endDate ? `<span class="badge badge-date"><i class="ti ti-calendar" style="font-size:11px"></i> ${formatDate(task.endDate)}</span>` : ''}
        ${task.hashtags?.map(h => `<span class="badge badge-tag">#${h.trim()}</span>`).join('') || ''}
      </div>
      ${task.subtasks?.length ? `
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${Math.round(task.subtasks.filter(s => s.done).length / task.subtasks.length * 100)}%"></div>
          </div>
          <p class="progress-label">${task.subtasks.filter(s => s.done).length} / ${task.subtasks.length} subtasks done</p>
        </div>` : ''}
      ${task.comments?.length ? `
        <div class="task-footer">
          <span><i class="ti ti-message"></i> ${task.comments.length} comment${task.comments.length > 1 ? 's' : ''}</span>
        </div>` : ''}
    </div>
  `).join('');
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

function editTask(id) {
  window.location.href = `/Tasks/Add?id=${id}`;
}

document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.textContent.toLowerCase();
    loadTasks();
  });
});

document.querySelector('.search-input').addEventListener('input', loadTasks);

document.querySelector('select').addEventListener('change', (e) => {
  currentPriority = e.target.value === 'All priorities' ? '' : e.target.value.toLowerCase();
  loadTasks();
});
document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link[data-filter]').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const filter = link.dataset.filter;
    if (filter === 'today') { currentView = 'day'; currentPriority = ''; }
    else if (filter === 'week') { currentView = 'week'; currentPriority = ''; }
    else if (filter === 'high') { currentView = 'all'; currentPriority = 'high'; }
    loadTasks();
  });
});
document.querySelector('.nav-link[href="/Account/Login"]').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = '/Account/Login';
});

function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

loadTasks();