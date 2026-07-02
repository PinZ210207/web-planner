const userId    = localStorage.getItem('userId');
const token     = localStorage.getItem('token');

if (!token || !userId) window.location.href = '/Account/Login';

const firstName = localStorage.getItem('firstName') || '';
const lastName  = localStorage.getItem('lastName') || '';
const email     = localStorage.getItem('email') || '';

document.getElementById('sidebar-name').textContent  = `${firstName} ${lastName}`;
document.getElementById('sidebar-email').textContent = email;
document.getElementById('sidebar-avatar').textContent = (firstName[0] || '') + (lastName[0] || '');

document.getElementById('first-name').value = firstName;
document.getElementById('last-name').value  = lastName;
document.getElementById('email').value      = email;

document.getElementById('profile-fullname').textContent    = `${firstName} ${lastName}`;
document.getElementById('profile-email-display').textContent = email;
document.getElementById('avatar-display').textContent      = (firstName[0] || '') + (lastName[0] || '');

const savedAvatar = localStorage.getItem('avatar');
if (savedAvatar) {
  document.getElementById('avatar-img').src     = savedAvatar;
  document.getElementById('avatar-img').style.display  = '';
  document.getElementById('avatar-display').style.display = 'none';
}

document.getElementById('avatar-btn').addEventListener('click', () => {
  document.getElementById('avatar-input').click();
});

document.getElementById('avatar-input').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target.result;
    localStorage.setItem('avatar', src);
    document.getElementById('avatar-img').src            = src;
    document.getElementById('avatar-img').style.display  = '';
    document.getElementById('avatar-display').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

document.getElementById('save-btn').addEventListener('click', async () => {
  const newFirstName = document.getElementById('first-name').value.trim();
  const newLastName  = document.getElementById('last-name').value.trim();
  const newEmail     = document.getElementById('email').value.trim();

  if (!newFirstName || !newLastName) return showError('Please enter your full name.');
  if (!newEmail) return showError('Please enter your email.');

  try {
    const res = await fetch(`/api/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: newFirstName, lastName: newLastName, email: newEmail })
    });

    if (!res.ok) {
      const data = await res.json();
      showError(data.message || 'Failed to update profile.');
      return;
    }

    localStorage.setItem('firstName', newFirstName);
    localStorage.setItem('lastName', newLastName);
    localStorage.setItem('email', newEmail);

    document.getElementById('sidebar-name').textContent       = `${newFirstName} ${newLastName}`;
    document.getElementById('sidebar-email').textContent      = newEmail;
    document.getElementById('sidebar-avatar').textContent     = (newFirstName[0] || '') + (newLastName[0] || '');
    document.getElementById('profile-fullname').textContent   = `${newFirstName} ${newLastName}`;
    document.getElementById('profile-email-display').textContent = newEmail;
    document.getElementById('avatar-display').textContent     = (newFirstName[0] || '') + (newLastName[0] || '');

    document.getElementById('success-msg').style.display = 'flex';
    document.getElementById('error-msg').style.display   = 'none';

    setTimeout(() => {
      document.getElementById('success-msg').style.display = 'none';
    }, 3000);

  } catch (err) {
    showError('Something went wrong. Try again.');
  }
});

document.getElementById('logout-btn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = '/Account/Login';
});

function showError(msg) {
  document.getElementById('error-msg').textContent    = msg;
  document.getElementById('error-msg').style.display  = '';
  document.getElementById('success-msg').style.display = 'none';
}