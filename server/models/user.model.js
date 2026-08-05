const db = require('../db');

function create({ name, email, passwordHash, role = 'user' }) {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, email, passwordHash, role);
  return findById(result.lastInsertRowid);
}

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(id) {
  return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
}

function updateProfile(id, { name, email }) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findById(id);
}

module.exports = { create, findByEmail, findById, updateProfile };
