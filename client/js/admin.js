let allBikes = [];

function renderBikeForm(bike = null) {
  const slot = document.getElementById('bike-form-slot');
  const isEdit = Boolean(bike);

  slot.innerHTML = `
    <div class="card bike-form-card">
      <div class="card-body">
        <h3>${isEdit ? 'Edit bike' : 'Add a new bike'}</h3>
        <div class="form-error-banner" id="bike-form-error"></div>
        <form id="bike-form">
          <div class="bike-form-grid">
            <div class="field">
              <label for="bike-name">Name</label>
              <input type="text" id="bike-name" value="${bike ? bike.name : ''}" required />
            </div>
            <div class="field">
              <label for="bike-type">Type</label>
              <select id="bike-type">
                <option value="commuter" ${bike?.type === 'commuter' ? 'selected' : ''}>Commuter</option>
                <option value="cruiser" ${bike?.type === 'cruiser' ? 'selected' : ''}>Cruiser</option>
                <option value="sports" ${bike?.type === 'sports' ? 'selected' : ''}>Sports</option>
                <option value="adventure" ${bike?.type === 'adventure' ? 'selected' : ''}>Adventure</option>
                <option value="scooter" ${bike?.type === 'scooter' ? 'selected' : ''}>Scooter</option>
              </select>
            </div>
            <div class="field field-full">
              <label for="bike-description">Description</label>
              <textarea id="bike-description" rows="2" required>${bike ? bike.description : ''}</textarea>
            </div>
            <div class="field">
              <label for="bike-price-hour">Price / hour</label>
              <input type="number" id="bike-price-hour" min="0.01" step="0.01" value="${bike ? bike.price_per_hour : ''}" required />
            </div>
            <div class="field">
              <label for="bike-price-day">Price / day</label>
              <input type="number" id="bike-price-day" min="0.01" step="0.01" value="${bike ? bike.price_per_day : ''}" required />
            </div>
            <div class="field">
              <label for="bike-engine-cc">Engine (cc)</label>
              <input type="number" id="bike-engine-cc" min="1" step="1" value="${bike ? bike.engine_cc : ''}" required />
            </div>
            <div class="field">
              <label for="bike-mileage">Mileage (kmpl)</label>
              <input type="number" id="bike-mileage" min="0.1" step="0.1" value="${bike ? bike.mileage_kmpl : ''}" required />
            </div>
            <div class="field">
              <label for="bike-fuel-type">Fuel type</label>
              <select id="bike-fuel-type">
                <option value="Petrol" ${bike?.fuel_type === 'Petrol' ? 'selected' : ''}>Petrol</option>
                <option value="Electric" ${bike?.fuel_type === 'Electric' ? 'selected' : ''}>Electric</option>
              </select>
            </div>
            <div class="field field-full">
              <label for="bike-image">Image URL</label>
              <input type="text" id="bike-image" value="${bike ? bike.image_url : ''}" required />
            </div>
            <div class="field">
              <label for="bike-location">Station / location</label>
              <input type="text" id="bike-location" value="${bike ? bike.location : ''}" required />
            </div>
            <div class="field">
              <label class="checkbox-label" style="margin-top: 2rem;">
                <input type="checkbox" id="bike-available" ${!bike || bike.is_available ? 'checked' : ''} />
                Available for booking
              </label>
            </div>
          </div>
          <div class="flex-gap">
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save changes' : 'Add bike'}</button>
            <button type="button" class="btn btn-outline" id="cancel-bike-form">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('cancel-bike-form').addEventListener('click', () => { slot.innerHTML = ''; });

  document.getElementById('bike-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('bike-form-error');
    errorEl.classList.remove('visible');

    const payload = {
      name: document.getElementById('bike-name').value.trim(),
      type: document.getElementById('bike-type').value,
      description: document.getElementById('bike-description').value.trim(),
      price_per_hour: Number(document.getElementById('bike-price-hour').value),
      price_per_day: Number(document.getElementById('bike-price-day').value),
      engine_cc: Number(document.getElementById('bike-engine-cc').value),
      mileage_kmpl: Number(document.getElementById('bike-mileage').value),
      fuel_type: document.getElementById('bike-fuel-type').value,
      image_url: document.getElementById('bike-image').value.trim(),
      location: document.getElementById('bike-location').value.trim(),
      is_available: document.getElementById('bike-available').checked,
    };

    try {
      const { api } = window.WheelHouseAPI;
      if (isEdit) {
        await api.put(`/bikes/${bike.id}`, payload, { auth: true });
      } else {
        await api.post('/bikes', payload, { auth: true });
      }
      slot.innerHTML = '';
      loadBikes();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('visible');
    }
  });
}

function renderBikesTable() {
  const tbody = document.getElementById('bikes-tbody');
  if (allBikes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No bikes in the fleet yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allBikes.map((bike) => `
    <tr>
      <td>${bike.name}</td>
      <td>${bike.type}</td>
      <td>${bike.location}</td>
      <td>$${bike.price_per_hour}</td>
      <td>$${bike.price_per_day}</td>
      <td><span class="badge ${bike.is_available ? 'badge-status-confirmed' : 'badge-status-cancelled'}">${bike.is_available ? 'Available' : 'Unavailable'}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-outline edit-bike-btn" data-id="${bike.id}">Edit</button>
          <button class="btn btn-danger delete-bike-btn" data-id="${bike.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-bike-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bike = allBikes.find((b) => b.id === Number(btn.dataset.id));
      renderBikeForm(bike);
      document.getElementById('bike-form-slot').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.delete-bike-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this bike? This cannot be undone.')) return;
      try {
        const { api } = window.WheelHouseAPI;
        await api.delete(`/bikes/${btn.dataset.id}`, { auth: true });
        loadBikes();
      } catch (err) {
        alert(`Couldn't delete bike: ${err.message}`);
      }
    });
  });
}

async function loadBikes() {
  document.getElementById('bikes-tbody').innerHTML = window.WheelHouseLoader.rowLoaderHTML(7, 'Loading bikes...');
  try {
    const { api } = window.WheelHouseAPI;
    const { bikes } = await api.get('/bikes');
    allBikes = bikes;
    renderBikesTable();
    document.querySelector('#stats-row .stat-card:nth-child(1) .stat-value').textContent = bikes.length;
  } catch (err) {
    document.getElementById('bikes-tbody').innerHTML = `<tr><td colspan="7">Couldn't load bikes: ${err.message}</td></tr>`;
  }
}

async function loadBookingsAndStats() {
  const tbody = document.getElementById('bookings-tbody');
  tbody.innerHTML = window.WheelHouseLoader.rowLoaderHTML(5, 'Loading bookings...');
  try {
    const { api } = window.WheelHouseAPI;
    const { bookings, stats } = await api.get('/bookings', { auth: true });

    document.querySelector('#stats-row .stat-card:nth-child(2) .stat-value').textContent = stats.total_rentals;
    document.querySelector('#stats-row .stat-card:nth-child(3) .stat-value').textContent = `$${stats.revenue.toFixed(2)}`;

    tbody.innerHTML = bookings.length
      ? bookings.map((b) => `
        <tr>
          <td>${b.bike_name}</td>
          <td>${b.user_name}<br><span style="color: var(--color-text-muted); font-size: 0.8rem;">${b.user_email}</span></td>
          <td>${new Date(b.start_time).toLocaleDateString()} &ndash; ${new Date(b.end_time).toLocaleDateString()}</td>
          <td><span class="badge badge-status-${b.status}">${b.status}</span></td>
          <td>$${b.total_price.toFixed(2)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="5">No bookings yet.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Couldn't load bookings: ${err.message}</td></tr>`;
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

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAdmin();
  if (!user) return;

  initTabs();
  loadBikes();
  loadBookingsAndStats();

  document.getElementById('add-bike-btn').addEventListener('click', () => {
    renderBikeForm();
    document.getElementById('bike-form-slot').scrollIntoView({ behavior: 'smooth' });
  });
});
