const userId = localStorage.getItem('userId');
const token  = localStorage.getItem('token');

if (!token || !userId) window.location.href = '/Account/Login';

const params = new URLSearchParams(window.location.search);
const savedAvatar = localStorage.getItem('avatar');
const avatarEl    = document.querySelector('.avatar');

if (avatarEl) {
  if (savedAvatar) {
    avatarEl.innerHTML = `<img src="${savedAvatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
  } else {
    const fn = localStorage.getItem('firstName') || '';
    const ln = localStorage.getItem('lastName') || '';
    avatarEl.textContent = (fn[0] || '') + (ln[0] || '');
  }
}
const taskId = params.get('id');

let subtasks = [];

const fileDrop  = document.getElementById('file-drop');
const fileInput = document.getElementById('file-input');
const fileList  = document.getElementById('file-list');

fileDrop.addEventListener('click', () => fileInput.click());
fileDrop.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileDrop.style.borderColor = 'var(--green)';
  fileDrop.style.background  = 'var(--green-bg)';
});
fileDrop.addEventListener('dragleave', () => {
  fileDrop.style.borderColor = '';
  fileDrop.style.background  = '';
});
fileDrop.addEventListener('drop', (e) => {
  e.preventDefault();
  fileDrop.style.borderColor = '';
  fileDrop.style.background  = '';
  fileInput.files = e.dataTransfer.files;
  renderFiles();
});
fileInput.addEventListener('change', renderFiles);

function renderFiles() {
  fileList.innerHTML = '';
  Array.from(fileInput.files).forEach(file => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-top:8px;font-size:13px;';
    item.innerHTML = `<i class="ti ti-file" style="color:var(--green);font-size:15px;"></i> ${file.name}`;
    fileList.appendChild(item);
  });
}

document.getElementById('add-subtask-btn').addEventListener('click', addSubtask);
document.getElementById('subtask-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addSubtask(); }
});

function addSubtask() {
  const text = document.getElementById('subtask-input').value.trim();
  if (!text) return;
  subtasks.push(text);
  document.getElementById('subtask-input').value = '';
  renderSubtasks();
}

function renderSubtasks() {
  document.getElementById('subtask-list').innerHTML = subtasks.map((s, i) => `
    <div class="subtask-item">
      <i class="ti ti-grip-vertical"></i>
      <span style="flex:1;">${s}</span>
      <button onclick="removeSubtask(${i})" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;">
        <i class="ti ti-x"></i>
      </button>
    </div>
  `).join('');
}

function removeSubtask(i) {
  subtasks.splice(i, 1);
  renderSubtasks();
}

if (taskId) {
  document.querySelector('.page-title').textContent = 'Edit Task';
  fetch(`/api/tasks?userId=${userId}`).then(r => r.json()).then(tasks => {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    document.getElementById('title').value       = task.title || '';
    document.getElementById('description').value = task.description || '';
    document.getElementById('priority').value    = task.priority || '';
    document.getElementById('end-date').value    = task.endDate?.slice(0, 10) || '';
    document.getElementById('hashtags').value    = (task.hashtags || []).join(', ');
    subtasks = (task.subtasks || []).map(s => s.text);
    renderSubtasks();
  });
}

document.querySelector('.btn-primary').addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  if (!title) return alert('Title is required.');

  const hashtags = document.getElementById('hashtags').value
    .split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean);

  const payload = {
    title,
    description: document.getElementById('description').value.trim(),
    priority:    document.getElementById('priority').value || null,
    endDate:     document.getElementById('end-date').value || null,
    done:        false,
    userId:      parseInt(userId),
    hashtags,
    subTasks:    subtasks
  };

  try {
    const url    = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
    const method = taskId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Failed to save task.');
      return;
    }

    window.location.href = '/Tasks/Index';
  } catch (err) {
    alert('Something went wrong. Try again.');
  }
});