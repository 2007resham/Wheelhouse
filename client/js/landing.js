async function loadFeaturedBikes() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = Array.from({ length: 4 }, renderBikeCardSkeleton).join('');

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

document.addEventListener('DOMContentLoaded', loadFeaturedBikes);
