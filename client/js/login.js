function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (message) {
    field.classList.add('has-error');
    field.querySelector('.error-text').textContent = message;
  } else {
    field.classList.remove('has-error');
  }
}

function showFormError(message) {
  const banner = document.getElementById('form-error');
  banner.textContent = message;
  banner.classList.toggle('visible', Boolean(message));
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || 'dashboard.html';
}

function validateLoginForm(email, password) {
  let valid = true;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('field-email', emailValid ? null : 'Enter a valid email address.');
  if (!emailValid) valid = false;

  setFieldError('field-password', password ? null : 'Password is required.');
  if (!password) valid = false;

  return valid;
}

document.addEventListener('DOMContentLoaded', () => {
  // Already signed in? No need to log in again.
  if (window.WheelHouseAPI.getStoredUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    showFormError("Password reset isn't available in this demo yet — try the demo account instead (demo@wheelhouse.app / password123).");
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError(null);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember-me').checked;

    if (!validateLoginForm(email, password)) return;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${window.WheelHouseLoader.inlineHTML('sm')}Logging in...`;

    try {
      const { api, saveSession } = window.WheelHouseAPI;
      const { token, user } = await api.post('/auth/login', { email, password });
      saveSession(token, user, remember);
      window.location.href = getRedirectTarget();
    } catch (err) {
      showFormError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
});
