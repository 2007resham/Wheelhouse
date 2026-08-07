const PENDING_BOOKING_KEY = 'wheelhouse_pending_booking';

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function priceBreakdown(startTime, endTime, bike) {
  const totalHours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours - fullDays * 24;
  const total = Math.round((fullDays * bike.price_per_day + remainingHours * bike.price_per_hour) * 100) / 100;
  return { fullDays, remainingHours, total };
}

function renderOrderSummary(bike, pending) {
  const { fullDays, remainingHours, total } = priceBreakdown(pending.startTime, pending.endTime, bike);

  document.getElementById('booking-content').innerHTML = `
    <h1>Confirm your booking</h1>

    <div class="card">
      <div class="card-body">
        <div class="booking-summary-card">
          <img class="booking-summary-image" src="${bike.image_url}" alt="${bike.name}" />
          <div class="booking-summary-info">
            <h3>${bike.name}</h3>
            <p>${bike.location}</p>
          </div>
        </div>

        <div class="order-line"><span>Pick-up</span><span>${formatDateTime(pending.startTime)}</span></div>
        <div class="order-line"><span>Drop-off</span><span>${formatDateTime(pending.endTime)}</span></div>
        ${fullDays > 0 ? `<div class="order-line"><span>${fullDays} day${fullDays === 1 ? '' : 's'} @ $${bike.price_per_day}/day</span><span>$${(fullDays * bike.price_per_day).toFixed(2)}</span></div>` : ''}
        ${remainingHours > 0 ? `<div class="order-line"><span>${remainingHours} hour${remainingHours === 1 ? '' : 's'} @ $${bike.price_per_hour}/hr</span><span>$${(remainingHours * bike.price_per_hour).toFixed(2)}</span></div>` : ''}
        <div class="order-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>

        <div class="payment-section">
          <h3>Payment</h3>
          <p class="payment-note">This is a demo — no real payment is processed. Any values below are accepted.</p>
          <div class="form-error-banner" id="payment-error"></div>
          <form id="payment-form">
            <div class="field">
              <label for="card-number">Card number</label>
              <input type="text" id="card-number" placeholder="4242 4242 4242 4242" required />
            </div>
            <div class="payment-row">
              <div class="field">
                <label for="card-expiry">Expiry</label>
                <input type="text" id="card-expiry" placeholder="MM/YY" required />
              </div>
              <div class="field">
                <label for="card-cvc">CVC</label>
                <input type="text" id="card-cvc" placeholder="123" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="confirm-btn">Pay $${total.toFixed(2)} &amp; confirm</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('payment-error');
    errorEl.classList.remove('visible');

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('card-expiry').value.trim();
    const cvc = document.getElementById('card-cvc').value.trim();

    if (!/^\d{12,19}$/.test(cardNumber)) return showPaymentError(errorEl, 'Enter a valid card number.');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return showPaymentError(errorEl, 'Expiry must be in MM/YY format.');
    if (!/^\d{3,4}$/.test(cvc)) return showPaymentError(errorEl, 'CVC must be 3 or 4 digits.');

    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';

    try {
      const { api } = window.WheelHouseAPI;
      const { booking } = await api.post('/bookings', {
        bikeId: bike.id,
        startTime: pending.startTime,
        endTime: pending.endTime,
      }, { auth: true });

      sessionStorage.removeItem(PENDING_BOOKING_KEY);
      renderConfirmation(booking, bike);
    } catch (err) {
      showPaymentError(errorEl, err.message);
      confirmBtn.disabled = false;
      confirmBtn.textContent = `Pay $${total.toFixed(2)} & confirm`;
    }
  });
}

function showPaymentError(errorEl, message) {
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function renderConfirmation(booking, bike) {
  document.getElementById('booking-content').innerHTML = `
    <div class="card">
      <div class="card-body confirmation-card">
        <div class="confirmation-icon">✓</div>
        <h1>Booking confirmed!</h1>
        <p>Your ${bike.name} is reserved for ${formatDateTime(booking.start_time)} &ndash; ${formatDateTime(booking.end_time)}.</p>
        <div class="flex-gap" style="justify-content: center;">
          <a href="dashboard.html" class="btn btn-primary">View my rentals</a>
          <a href="browse.html" class="btn btn-outline">Browse more bikes</a>
        </div>
      </div>
    </div>
  `;
}

async function init() {
  const user = requireLoggedIn();
  if (!user) return;

  const content = document.getElementById('booking-content');
  const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
  if (!raw) {
    content.innerHTML = `<div class="empty-state">No booking in progress. <a href="browse.html">Browse bikes</a> to get started.</div>`;
    return;
  }

  const pending = JSON.parse(raw);
  try {
    const { api } = window.WheelHouseAPI;
    const { bike } = await api.get(`/bikes/${pending.bikeId}`);
    renderOrderSummary(bike, pending);
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Couldn't load booking details: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
