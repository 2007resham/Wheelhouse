const db = require('../db');

const BASE_SELECT = `
  SELECT r.*, u.name AS user_name
  FROM reviews r
  JOIN users u ON u.id = r.user_id
`;

function getByBike(bikeId) {
  return db.prepare(`${BASE_SELECT} WHERE r.bike_id = ? ORDER BY r.created_at DESC`).all(bikeId);
}

function create({ bikeId, userId, rating, comment }) {
  const stmt = db.prepare(`
    INSERT INTO reviews (bike_id, user_id, rating, comment) VALUES (@bikeId, @userId, @rating, @comment)
  `);
  const result = stmt.run({ bikeId, userId, rating, comment: comment ?? null });
  return db.prepare(`${BASE_SELECT} WHERE r.id = ?`).get(result.lastInsertRowid);
}

module.exports = { getByBike, create };
