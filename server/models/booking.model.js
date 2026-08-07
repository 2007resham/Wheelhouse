const db = require('../db');

const BASE_SELECT = `
  SELECT
    bo.*,
    bi.name AS bike_name,
    bi.image_url AS bike_image_url,
    bi.type AS bike_type,
    bi.location AS bike_location,
    u.name AS user_name,
    u.email AS user_email
  FROM bookings bo
  JOIN bikes bi ON bi.id = bo.bike_id
  JOIN users u ON u.id = bo.user_id
`;

function create({ userId, bikeId, startTime, endTime, status = 'confirmed', totalPrice }) {
  const stmt = db.prepare(`
    INSERT INTO bookings (user_id, bike_id, start_time, end_time, status, total_price)
    VALUES (@userId, @bikeId, @startTime, @endTime, @status, @totalPrice)
  `);
  const result = stmt.run({ userId, bikeId, startTime, endTime, status, totalPrice });
  return getById(result.lastInsertRowid);
}

function getById(id) {
  return db.prepare(`${BASE_SELECT} WHERE bo.id = ?`).get(id);
}

function getByUser(userId) {
  return db.prepare(`${BASE_SELECT} WHERE bo.user_id = ? ORDER BY bo.start_time DESC`).all(userId);
}

function getAll() {
  return db.prepare(`${BASE_SELECT} ORDER BY bo.created_at DESC`).all();
}

function cancel(id, userId) {
  const booking = getById(id);
  if (!booking || booking.user_id !== userId) return null;
  db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`).run(id);
  return getById(id);
}

function getStats() {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS total_rentals,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) AS revenue
    FROM bookings
  `).get();
  return totals;
}

module.exports = { create, getById, getByUser, getAll, cancel, getStats };
