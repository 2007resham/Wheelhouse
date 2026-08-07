function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return `${new Date(start).toLocaleString(undefined, opts)} — ${new Date(end).toLocaleString(undefined, opts)}`;
}

function renderRentalCard(booking) {
  const canCancel = booking.status === 'confirmed';
  return `
    <div class="rental-card" data-booking-id="${booking.id}">
      <img class="rental-image" src="${booking.bike_image_url}" alt="${booking.bike_name}" />
      <div class="rental-info">
        <h3>${booking.bike_name}</h3>
        <p>${formatDateRange(booking.start_time, booking.end_time)}</p>
        <p>${booking.bike_location}</p>
      </div>
      <div class="rental-actions">
        <span class="badge badge-status-${booking.status}">${booking.status}</span>
        <span class="rental-price">$${booking.total_price.toFixed(2)}</span>
        ${canCancel ? `<button class="btn btn-danger cancel-btn" data-id="${booking.id}" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;">Cancel</button>` : ''}
      </div>
    </div>
  `;
}

async function loadRentals() {
  const activeEl = document.getElementById('active-rentals');
  const pastEl = document.getElementById('past-rentals');

  activeEl.innerHTML = window.WheelHouseLoader.gridLoaderHTML('Loading your rentals...');
  pastEl.innerHTML = '';

  try {
    const { api } = window.WheelHouseAPI;
    const { bookings } = await api.get('/bookings/me', { auth: true });

    const active = bookings.filter((b) => b.status === 'confirmed');
    const past = bookings.filter((b) => b.status !== 'confirmed');

    activeEl.innerHTML = active.length
      ? active.map(renderRentalCard).join('')
      : `<p class="text-center" style="color: var(--color-text-muted);">No active rentals. <a href="browse.html">Browse bikes</a> to book one.</p>`;

    pastEl.innerHTML = past.length
      ? past.map(renderRentalCard).join('')
      : `<p style="color: var(--color-text-muted);">No past rentals yet.</p>`;

    document.querySelectorAll('.cancel-btn').forEach((btn) => {
      btn.addEventListener('click', () => cancelBooking(btn.dataset.id, btn));
    });
  } catch (err) {
    activeEl.innerHTML = `<p>Couldn't load rentals: ${err.message}</p>`;
  }
}

async function cancelBooking(id, btn) {
  if (!confirm('Cancel this booking?')) return;
  btn.disabled = true;
  btn.innerHTML = `${window.WheelHouseLoader.inlineHTML('sm')}Cancelling...`;
  try {
    const { api } = window.WheelHouseAPI;
    await api.delete(`/bookings/${id}`, { auth: true });
    loadRentals();
  } catch (err) {
    alert(`Couldn't cancel booking: ${err.message}`);
    btn.disabled = false;
    btn.textContent = 'Cancel';
  }
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.hidden = panel.id !== `tab-${btn.dataset.tab}`;
      });
    });
  });
}

function initProfileForm(user) {
  document.getElementById('profile-name').value = user.name;
  document.getElementById('profile-email').value = user.email;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('profile-error');
    const successEl = document.getElementById('profile-success');
    errorEl.classList.remove('visible');
    successEl.classList.remove('visible');

    const submitBtn = document.getElementById('profile-submit-btn');
    submitBtn.disabled = true;

    try {
      const { api, updateStoredUser } = window.WheelHouseAPI;
      const { user: updatedUser } = await api.put('/auth/me', {
        name: document.getElementById('profile-name').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
      }, { auth: true });

      updateStoredUser(updatedUser);
      successEl.textContent = 'Profile updated.';
      successEl.classList.add('visible');
      renderNavAuthState();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireLoggedIn();
  if (!user) return;

  initTabs();
  initProfileForm(user);
  loadRentals();
});
