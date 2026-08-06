function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

let locationsPopulated = false;

function populateLocations(locations) {
  if (locationsPopulated) return;
  const select = document.getElementById('location-filter');
  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    select.appendChild(option);
  });
  locationsPopulated = true;
}

function buildQueryParams() {
  const params = new URLSearchParams();

  const search = document.getElementById('search-input').value.trim();
  const type = document.getElementById('type-filter').value;
  const location = document.getElementById('location-filter').value;
  const maxPrice = document.getElementById('max-price-filter').value;
  const sort = document.getElementById('sort-select').value;

  if (search) params.set('search', search);
  if (type) params.set('type', type);
  if (location) params.set('location', location);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (sort) params.set('sort', sort);

  return params.toString();
}

async function loadBikes() {
  const grid = document.getElementById('bike-grid');
  const resultsCount = document.getElementById('results-count');

  grid.innerHTML = Array.from({ length: 8 }, renderBikeCardSkeleton).join('');
  resultsCount.textContent = '';

  try {
    const { api } = window.WheelHouseAPI;
    const query = buildQueryParams();
    const { bikes, locations } = await api.get(`/bikes${query ? `?${query}` : ''}`);

    populateLocations(locations);

    if (bikes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="28" cy="55" r="15" stroke="#5C5C57" stroke-width="4"/>
            <circle cx="60" cy="55" r="15" stroke="#5C5C57" stroke-width="4"/>
            <path d="M28 55 L45 25 L60 55 M45 25 L38 55 M45 25 L55 25" stroke="#5C5C57" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <h3>No bikes match your filters</h3>
          <p>Try widening your search or clearing a filter.</p>
        </div>
      `;
      resultsCount.textContent = '0 bikes found';
      return;
    }

    grid.innerHTML = bikes.map((bike) => renderBikeCard(bike)).join('');
    resultsCount.textContent = `${bikes.length} bike${bikes.length === 1 ? '' : 's'} found`;
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Couldn't load bikes: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBikes();

  document.getElementById('search-input').addEventListener('input', debounce(loadBikes, 350));
  ['type-filter', 'location-filter', 'max-price-filter', 'sort-select'].forEach((id) => {
    document.getElementById(id).addEventListener('change', loadBikes);
  });
});
