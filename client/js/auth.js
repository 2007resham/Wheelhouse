// Shared nav behavior: logged-in/out state, logout, mobile menu toggle,
// and a guard for pages that require a session. Included on every page.

function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function renderNavAuthState() {
  const slot = document.getElementById('nav-auth-slot');
  if (!slot) return;

  const user = window.WheelHouseAPI.getStoredUser();

  if (!user) {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-outline">Log in</a>
      <a href="signup.html" class="btn btn-primary">Sign up</a>
    `;
    return;
  }

  slot.innerHTML = `
    <a href="dashboard.html" class="nav-user-chip">
      <span class="nav-avatar">${initialsFor(user.name)}</span>
      <span>${user.name.split(' ')[0]}</span>
    </a>
    <button class="btn btn-outline" id="logout-btn">Log out</button>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    window.WheelHouseAPI.clearSession();
    window.location.href = 'index.html';
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links.classList.contains('open'));
  });
}

// Call at the top of a protected page's script to bounce guests to login.
function requireLoggedIn() {
  const user = window.WheelHouseAPI.getStoredUser();
  if (!user) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname.split('/').pop())}`;
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = requireLoggedIn();
  if (user && user.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavAuthState();
  initMobileNav();
});
