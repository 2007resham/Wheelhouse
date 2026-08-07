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

// Pages live either at /client/index.html or one level down in /client/pages/,
// so nav links need a prefix that resolves correctly from either location.
function siteRootPrefix() {
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

function renderNavAuthState() {
  const slot = document.getElementById('nav-auth-slot');
  if (!slot) return;

  const user = window.WheelHouseAPI.getStoredUser();
  const root = siteRootPrefix();

  if (!user) {
    slot.innerHTML = `
      <a href="${root}pages/login.html" class="btn btn-outline">Log in</a>
      <a href="${root}pages/signup.html" class="btn btn-primary">Sign up</a>
    `;
    return;
  }

  slot.innerHTML = `
    ${user.role === 'admin' ? `<a href="${root}pages/admin.html" class="btn btn-outline">Admin</a>` : ''}
    <a href="${root}pages/dashboard.html" class="nav-user-chip">
      <span class="nav-avatar">${initialsFor(user.name)}</span>
      <span>${user.name.split(' ')[0]}</span>
    </a>
    <button class="btn btn-outline" id="logout-btn">Log out</button>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    window.WheelHouseAPI.clearSession();
    window.location.href = `${root}index.html`;
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
