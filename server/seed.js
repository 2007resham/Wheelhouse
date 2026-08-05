const bcrypt = require('bcryptjs');
const db = require('./db');

const BIKES = [
  { name: 'Harbor Cruiser', type: 'city', description: 'A comfortable upright city bike with a padded seat and front basket, perfect for relaxed rides along the waterfront.', price_per_hour: 4, price_per_day: 22, image_url: 'https://picsum.photos/seed/wh-bike-1/640/480', location: 'Downtown Station' },
  { name: 'Commuter Classic', type: 'city', description: 'Lightweight step-through frame with a 7-speed hub, built for quick trips through traffic.', price_per_hour: 4.5, price_per_day: 24, image_url: 'https://picsum.photos/seed/wh-bike-2/640/480', location: 'Central Station' },
  { name: 'Skyline Roadster', type: 'city', description: 'Sleek road-style city bike with slick tires for fast pavement rides.', price_per_hour: 5, price_per_day: 26, image_url: 'https://picsum.photos/seed/wh-bike-3/640/480', location: 'Riverside Station' },
  { name: 'Old Town Roller', type: 'city', description: 'Retro-styled cruiser with a wide, cushioned saddle and coaster brakes.', price_per_hour: 4, price_per_day: 20, image_url: 'https://picsum.photos/seed/wh-bike-4/640/480', location: 'Old Town Station' },
  { name: 'Trailblazer 27', type: 'mountain', description: '27-speed hardtail mountain bike with hydraulic disc brakes, built for rougher terrain.', price_per_hour: 6, price_per_day: 35, image_url: 'https://picsum.photos/seed/wh-bike-5/640/480', location: 'Park Station' },
  { name: 'Ridge Runner', type: 'mountain', description: 'Full-suspension mountain bike with aggressive tread, ideal for trail rides.', price_per_hour: 7, price_per_day: 40, image_url: 'https://picsum.photos/seed/wh-bike-6/640/480', location: 'Hillcrest Station' },
  { name: 'Boulder Climber', type: 'mountain', description: 'Steel-frame hardtail built tough for climbs and rocky descents.', price_per_hour: 6.5, price_per_day: 37, image_url: 'https://picsum.photos/seed/wh-bike-7/640/480', location: 'Park Station' },
  { name: 'Summit Seeker', type: 'mountain', description: 'Carbon-fork mountain bike with wide-grip handlebars for technical trails.', price_per_hour: 7.5, price_per_day: 42, image_url: 'https://picsum.photos/seed/wh-bike-8/640/480', location: 'Hillcrest Station' },
  { name: 'Volt Glide', type: 'electric', description: 'Pedal-assist electric bike with a 50-mile range battery and USB charging port.', price_per_hour: 9, price_per_day: 55, image_url: 'https://picsum.photos/seed/wh-bike-9/640/480', location: 'Central Station' },
  { name: 'Current Commuter', type: 'electric', description: 'Electric city bike with a throttle-assist motor, great for hilly commutes.', price_per_hour: 8.5, price_per_day: 50, image_url: 'https://picsum.photos/seed/wh-bike-10/640/480', location: 'Downtown Station' },
  { name: 'Watt Wanderer', type: 'electric', description: 'Long-range e-bike with a comfortable upright riding position and integrated lights.', price_per_hour: 9.5, price_per_day: 58, image_url: 'https://picsum.photos/seed/wh-bike-11/640/480', location: 'Riverside Station' },
  { name: 'Surge Sport', type: 'electric', description: 'Sport-tuned e-bike with a high-torque motor for quick acceleration around town.', price_per_hour: 10, price_per_day: 60, image_url: 'https://picsum.photos/seed/wh-bike-12/640/480', location: 'Old Town Station' },
  { name: 'Meadow Roller', type: 'city', description: 'A soft-riding city bike with wide tires that smooth out cobblestones and cracked pavement.', price_per_hour: 4.5, price_per_day: 23, image_url: 'https://picsum.photos/seed/wh-bike-13/640/480', location: 'Riverside Station' },
  { name: 'Granite Trail', type: 'mountain', description: 'Entry-level mountain bike, light enough for beginners tackling their first trails.', price_per_hour: 6, price_per_day: 34, image_url: 'https://picsum.photos/seed/wh-bike-14/640/480', location: 'Hillcrest Station' },
];

function seed() {
  const existingBikeCount = db.prepare('SELECT COUNT(*) AS count FROM bikes').get().count;
  if (existingBikeCount > 0) {
    console.log('Database already seeded — skipping. Delete wheelhouse.db to reseed from scratch.');
    return;
  }

  const insertBike = db.prepare(`
    INSERT INTO bikes (name, type, description, price_per_hour, price_per_day, image_url, location, is_available)
    VALUES (@name, @type, @description, @price_per_hour, @price_per_day, @image_url, @location, 1)
  `);

  db.exec('BEGIN');
  for (const bike of BIKES) insertBike.run(bike);
  db.exec('COMMIT');
  console.log(`Seeded ${BIKES.length} bikes.`);

  const demoPasswordHash = bcrypt.hashSync('password123', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  `);
  const demoUser = insertUser.run('Demo Rider', 'demo@wheelhouse.app', demoPasswordHash, 'user');
  insertUser.run('Ava Admin', 'admin@wheelhouse.app', demoPasswordHash, 'admin');
  console.log('Seeded demo user (demo@wheelhouse.app / password123) and admin (admin@wheelhouse.app / password123).');

  const demoUserId = demoUser.lastInsertRowid;

  const insertBooking = db.prepare(`
    INSERT INTO bookings (user_id, bike_id, start_time, end_time, status, total_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertBooking.run(demoUserId, 1, '2026-07-10 09:00', '2026-07-10 17:00', 'completed', 22);
  insertBooking.run(demoUserId, 5, '2026-08-20 10:00', '2026-08-20 14:00', 'confirmed', 24);
  console.log('Seeded sample bookings.');

  const insertReview = db.prepare(`
    INSERT INTO reviews (bike_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
  `);
  insertReview.run(1, demoUserId, 5, 'Super smooth ride along the harbor, basket was handy for groceries.');
  insertReview.run(5, demoUserId, 4, 'Handled the park trails well, brakes felt a little stiff at first.');
  insertReview.run(9, demoUserId, 5, 'Battery lasted the whole day, great for a longer commute.');
  console.log('Seeded sample reviews.');
}

seed();
