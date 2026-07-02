document.querySelector('.btn').addEventListener('click', async () => {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName  = document.getElementById('last-name').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const confirm   = document.getElementById('confirm-password').value;

  if (!firstName || !lastName) return alert('Please enter your full name.');
  if (!email)                   return alert('Please enter your email.');
  if (!password)                return alert('Please enter a password.');
  if (password !== confirm)     return alert('Passwords do not match.');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Sign up failed.');
      return;
    }

    alert('Account created! Please sign in.');
    window.location.href = '/Account/Login';
  } catch (err) {
    alert('Something went wrong. Try again.');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.querySelector('.btn').click();
});