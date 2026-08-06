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

function validateSignupForm(name, email, password, confirmPassword) {
  let valid = true;

  setFieldError('field-name', name ? null : 'Enter your full name.');
  if (!name) valid = false;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('field-email', emailValid ? null : 'Enter a valid email address.');
  if (!emailValid) valid = false;

  const passwordValid = password.length >= 6;
  setFieldError('field-password', passwordValid ? null : 'Password must be at least 6 characters.');
  if (!passwordValid) valid = false;

  const confirmValid = passwordValid && password === confirmPassword;
  setFieldError('field-confirm-password', confirmValid ? null : 'Passwords do not match.');
  if (!confirmValid) valid = false;

  return valid;
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.WheelHouseAPI.getStoredUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError(null);

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!validateSignupForm(name, email, password, confirmPassword)) return;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const { api, saveSession } = window.WheelHouseAPI;
      const { token, user } = await api.post('/auth/signup', { name, email, password });
      saveSession(token, user, true);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showFormError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });
});
