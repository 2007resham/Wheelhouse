const db = require('../db');

const BASE_SELECT = `
  SELECT
    b.*,
    COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
    COUNT(r.id) AS review_count
  FROM bikes b
  LEFT JOIN reviews r ON r.bike_id = b.id
`;

function getAll({ type, minPrice, maxPrice, location, search, sort } = {}) {
  const where = [];
  const params = {};

  if (type) {
    where.push('b.type = @type');
    params.type = type;
  }
  if (minPrice !== undefined) {
    where.push('b.price_per_hour >= @minPrice');
    params.minPrice = minPrice;
  }
  if (maxPrice !== undefined) {
    where.push('b.price_per_hour <= @maxPrice');
    params.maxPrice = maxPrice;
  }
  if (location) {
    where.push('b.location = @location');
    params.location = location;
  }
  if (search) {
    where.push('(b.name LIKE @search OR b.description LIKE @search)');
    params.search = `%${search}%`;
  }

  let sql = BASE_SELECT;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' GROUP BY b.id';

  const sortMap = {
    price_asc: 'b.price_per_hour ASC',
    price_desc: 'b.price_per_hour DESC',
    rating: 'avg_rating DESC',
    availability: 'b.is_available DESC',
  };
  sql += ` ORDER BY ${sortMap[sort] || 'b.id ASC'}`;

  return db.prepare(sql).all(params);
}

function getById(id) {
  return db.prepare(`${BASE_SELECT} WHERE b.id = @id GROUP BY b.id`).get({ id });
}

function getLocations() {
  return db.prepare('SELECT DISTINCT location FROM bikes ORDER BY location').all().map((r) => r.location);
}

function create(bike) {
  const stmt = db.prepare(`
    INSERT INTO bikes (name, type, description, price_per_hour, price_per_day, image_url, location, is_available, engine_cc, mileage_kmpl, fuel_type)
    VALUES (@name, @type, @description, @price_per_hour, @price_per_day, @image_url, @location, @is_available, @engine_cc, @mileage_kmpl, @fuel_type)
  `);
  const result = stmt.run({ is_available: 1, ...bike });
  return getById(result.lastInsertRowid);
}

function update(id, bike) {
  const existing = getById(id);
  if (!existing) return null;
  const merged = {
    name: bike.name ?? existing.name,
    type: bike.type ?? existing.type,
    description: bike.description ?? existing.description,
    price_per_hour: bike.price_per_hour ?? existing.price_per_hour,
    price_per_day: bike.price_per_day ?? existing.price_per_day,
    image_url: bike.image_url ?? existing.image_url,
    location: bike.location ?? existing.location,
    is_available: bike.is_available ?? existing.is_available,
    engine_cc: bike.engine_cc ?? existing.engine_cc,
    mileage_kmpl: bike.mileage_kmpl ?? existing.mileage_kmpl,
    fuel_type: bike.fuel_type ?? existing.fuel_type,
    id,
  };
  db.prepare(`
    UPDATE bikes SET name = @name, type = @type, description = @description,
      price_per_hour = @price_per_hour, price_per_day = @price_per_day,
      image_url = @image_url, location = @location, is_available = @is_available,
      engine_cc = @engine_cc, mileage_kmpl = @mileage_kmpl, fuel_type = @fuel_type
    WHERE id = @id
  `).run(merged);
  return getById(id);
}

function remove(id) {
  const result = db.prepare('DELETE FROM bikes WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = { getAll, getById, getLocations, create, update, remove };
