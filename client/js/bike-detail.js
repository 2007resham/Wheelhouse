const PENDING_BOOKING_KEY = 'wheelhouse_pending_booking';

function getBikeId() {
  return new URLSearchParams(window.location.search).get('id');
}

// Mirrors the pricing rule in server/controllers/bookings.controller.js so the
// estimate shown here matches what the server will actually charge.
function estimatePrice(startTime, endTime, bike) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;

  const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours - fullDays * 24;
  return Math.round((fullDays * bike.price_per_day + remainingHours * bike.price_per_hour) * 100) / 100;
}

function renderDetail(bike) {
  const badgeClass = bike.is_available ? '' : 'unavailable-notice';
  document.title = `${bike.name} — WheelHouse`;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-grid">
      <img class="detail-image" src="${bike.image_url}" alt="${bike.name}" />
      <div class="detail-info">
        <span class="badge">${bike.type}</span>
        <h1>${bike.name}</h1>
        <div class="detail-location">📍 ${bike.location}</div>
        <div class="detail-rating">
          ${bike.review_count > 0 ? `★ ${bike.avg_rating} (${bike.review_count} review${bike.review_count === 1 ? '' : 's'})` : 'No reviews yet'}
        </div>
        <p class="detail-description">${bike.description}</p>

        <div class="detail-prices">
          <div class="detail-price-block">
            <div class="value">$${bike.price_per_hour}</div>
            <div class="label">per hour</div>
          </div>
          <div class="detail-price-block">
            <div class="value">$${bike.price_per_day}</div>
            <div class="label">per day</div>
          </div>
        </div>

        ${!bike.is_available ? `<div class="unavailable-notice">This bike is currently unavailable for booking.</div>` : ''}

        <div class="booking-widget">
          <h3>Book this bike</h3>
          <form id="booking-form">
            <div class="field-row">
              <div class="field">
                <label for="start-time">Start</label>
                <input type="datetime-local" id="start-time" required />
              </div>
              <div class="field">
                <label for="end-time">End</label>
                <input type="datetime-local" id="end-time" required />
              </div>
            </div>
            <div class="booking-estimate">
              <span>Estimated total</span>
              <span class="amount" id="estimate-amount">—</span>
            </div>
            <div class="booking-error" id="booking-error"></div>
            <button type="submit" class="btn btn-primary btn-block" id="book-now-btn" ${bike.is_available ? '' : 'disabled'}>
              ${bike.is_available ? 'Book now' : 'Unavailable'}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  const startInput = document.getElementById('start-time');
  const endInput = document.getElementById('end-time');
  const estimateEl = document.getElementById('estimate-amount');
  const errorEl = document.getElementById('booking-error');

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  startInput.min = nowLocal;
  endInput.min = nowLocal;

  function updateEstimate() {
    errorEl.textContent = '';
    if (!startInput.value || !endInput.value) {
      estimateEl.textContent = '—';
      return;
    }
    const price = estimatePrice(startInput.value, endInput.value, bike);
    if (price === null) {
      estimateEl.textContent = '—';
      errorEl.textContent = 'End time must be after start time.';
      return;
    }
    estimateEl.textContent = `$${price.toFixed(2)}`;
  }

  startInput.addEventListener('change', updateEstimate);
  endInput.addEventListener('change', updateEstimate);

  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const price = estimatePrice(startInput.value, endInput.value, bike);
    if (price === null) {
      errorEl.textContent = 'Choose a valid start and end time.';
      return;
    }

    const pendingBooking = { bikeId: bike.id, startTime: startInput.value, endTime: endInput.value };
    sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(pendingBooking));

    const user = window.WheelHouseAPI.getStoredUser();
    if (!user) {
      window.location.href = `login.html?redirect=${encodeURIComponent('booking.html')}`;
      return;
    }
    window.location.href = 'booking.html';
  });
}

function renderReviews(reviews) {
  const list = document.getElementById('reviews-list');
  if (reviews.length === 0) {
    list.innerHTML = `<p class="text-center">No reviews yet — be the first to ride and rate this bike.</p>`;
    return;
  }
  list.innerHTML = reviews.map((review) => `
    <div class="review-card">
      <div class="review-card-top">
        <span class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
        <span class="review-meta">${new Date(review.created_at).toLocaleDateString()}</span>
      </div>
      ${review.comment ? `<p style="margin: 0;">${review.comment}</p>` : ''}
    </div>
  `).join('');
}

function renderReviewForm(bikeId) {
  const slot = document.getElementById('review-form-slot');
  const user = window.WheelHouseAPI.getStoredUser();

  if (!user) {
    slot.innerHTML = `<p class="text-center"><a href="login.html">Log in</a> to leave a review.</p>`;
    return;
  }

  slot.innerHTML = `
    <div class="review-form-card">
      <h3 style="margin-bottom: var(--space-md);">Leave a review</h3>
      <div class="form-error-banner" id="review-error"></div>
      <form id="review-form">
        <div class="field-row">
          <div class="field">
            <label for="review-rating">Rating</label>
            <select id="review-rating">
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>
          <div class="field">
            <label for="review-comment">Comment (optional)</label>
            <textarea id="review-comment" rows="2"></textarea>
          </div>
        </div>
        <button type="submit" class="btn btn-secondary" id="review-submit-btn">Submit review</button>
      </form>
    </div>
  `;

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('review-error');
    errorEl.classList.remove('visible');
    const submitBtn = document.getElementById('review-submit-btn');
    submitBtn.disabled = true;

    try {
      const { api } = window.WheelHouseAPI;
      await api.post(`/bikes/${bikeId}/reviews`, {
        rating: Number(document.getElementById('review-rating').value),
        comment: document.getElementById('review-comment').value.trim(),
      }, { auth: true });

      const { reviews } = await api.get(`/bikes/${bikeId}/reviews`);
      renderReviews(reviews);
      const bikeRes = await api.get(`/bikes/${bikeId}`);
      renderDetail(bikeRes.bike);
      renderReviewForm(bikeId);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function init() {
  const bikeId = getBikeId();
  const content = document.getElementById('detail-content');

  if (!bikeId) {
    content.innerHTML = `<div class="empty-state">No bike specified. <a href="browse.html">Browse bikes</a></div>`;
    return;
  }

  try {
    const { api } = window.WheelHouseAPI;
    const [{ bike }, { reviews }] = await Promise.all([
      api.get(`/bikes/${bikeId}`),
      api.get(`/bikes/${bikeId}/reviews`),
    ]);

    renderDetail(bike);
    renderReviews(reviews);
    renderReviewForm(bikeId);
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Couldn't load this bike: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
