// Shared bike card renderer used by the landing page's featured section and the browse grid.

function renderBikeCard(bike, linkPrefix = '') {
  const unavailableClass = bike.is_available ? '' : 'bike-card-unavailable';
  const ratingText = bike.review_count > 0 ? `★ ${bike.avg_rating} (${bike.review_count})` : 'No reviews yet';

  return `
    <a href="${linkPrefix}bike-detail.html?id=${bike.id}" class="card bike-card ${unavailableClass}">
      <img class="bike-card-image" src="${bike.image_url}" alt="${bike.name}" loading="lazy" />
      <div class="card-body">
        <div class="bike-card-top">
          <div>
            <span class="badge">${bike.type}</span>
            <h3 style="margin: 0.5rem 0 0.2rem;">${bike.name}</h3>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${bike.location}</span>
          </div>
        </div>
        <div class="bike-card-rating">${ratingText}</div>
        <div class="bike-card-footer">
          <div class="bike-card-price">$${bike.price_per_hour}<span>/hr</span></div>
          <span class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
            ${bike.is_available ? 'View details' : 'Unavailable'}
          </span>
        </div>
      </div>
    </a>
  `;
}

function renderBikeCardSkeleton() {
  return `
    <div class="card bike-card">
      <div class="skeleton bike-card-image"></div>
      <div class="card-body">
        <div class="skeleton" style="height: 1rem; width: 40%; border-radius: 999px;"></div>
        <div class="skeleton" style="height: 1.2rem; width: 70%;"></div>
        <div class="skeleton" style="height: 0.9rem; width: 50%;"></div>
        <div class="skeleton" style="height: 1.4rem; width: 100%; margin-top: 0.5rem;"></div>
      </div>
    </div>
  `;
}

window.renderBikeCard = renderBikeCard;
window.renderBikeCardSkeleton = renderBikeCardSkeleton;
