const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'wheelhouse.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Schema is created here so the app works on a fresh checkout with zero setup steps.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('city', 'mountain', 'electric')),
    description TEXT NOT NULL,
    price_per_hour REAL NOT NULL,
    price_per_day REAL NOT NULL,
    image_url TEXT NOT NULL,
    location TEXT NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bike_id INTEGER NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    total_price REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bike_id INTEGER NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_bike ON bookings(bike_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_bike ON reviews(bike_id);
`);

module.exports = db;
