async function loadFeaturedBikes() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = window.WheelHouseLoader.gridLoaderHTML('Loading featured bikes...');

  try {
    const { api } = window.WheelHouseAPI;
    const { bikes } = await api.get('/bikes?sort=rating');
    const featured = bikes.slice(0, 4);

    if (featured.length === 0) {
      grid.innerHTML = `<div class="empty-state">No bikes available right now — check back soon.</div>`;
      return;
    }

    grid.innerHTML = featured.map((bike) => renderBikeCard(bike, 'pages/')).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Couldn't load featured bikes: ${err.message}</div>`;
  }
}

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedBikes();
  initScrollReveal();
});
