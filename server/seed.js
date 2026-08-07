const bcrypt = require('bcryptjs');
const db = require('./db');

const BIKES = [
  { name: 'Royal Enfield Bullet 350', type: 'cruiser', description: 'The original thumper — a classic long-stroke single with unmistakable low-rev torque, built for relaxed highway cruising.', price_per_hour: 10, price_per_day: 62, image_url: '/assets/bikes/royal-enfield-bullet-350.jpg', location: 'Downtown Station', engine_cc: 349, mileage_kmpl: 35, fuel_type: 'Petrol' },
  { name: 'Royal Enfield Classic 350', type: 'cruiser', description: 'Retro styling, a comfortable upright seating position, and that signature exhaust note make this the go-to bike for weekend rides.', price_per_hour: 11, price_per_day: 65, image_url: '/assets/bikes/royal-enfield-classic-350.jpg', location: 'Central Station', engine_cc: 349, mileage_kmpl: 35, fuel_type: 'Petrol' },
  { name: 'Royal Enfield Meteor 350', type: 'cruiser', description: 'A modern cruiser with a wide handlebar, plush seat, and smooth low-end power — built for effortless long-distance touring.', price_per_hour: 12, price_per_day: 68, image_url: '/assets/bikes/royal-enfield-meteor-350.jpg', location: 'Riverside Station', engine_cc: 349, mileage_kmpl: 36, fuel_type: 'Petrol' },
  { name: 'Royal Enfield Himalayan', type: 'adventure', description: 'A go-anywhere adventure tourer with long-travel suspension and a rugged frame, equally happy on backroads or open highway.', price_per_hour: 13, price_per_day: 75, image_url: '/assets/bikes/royal-enfield-himalayan.jpg', location: 'Hillcrest Station', engine_cc: 411, mileage_kmpl: 30, fuel_type: 'Petrol' },
  { name: 'Royal Enfield Scram 411', type: 'adventure', description: 'A scrambler-styled adventure bike with a lower seat height and grippy dual-purpose tires — confident on tarmac and gravel alike.', price_per_hour: 12.5, price_per_day: 72, image_url: '/assets/bikes/royal-enfield-scram-411.jpg', location: 'Park Station', engine_cc: 411, mileage_kmpl: 31, fuel_type: 'Petrol' },
  { name: 'Bajaj Pulsar 150', type: 'commuter', description: 'A dependable everyday commuter with sporty styling, a punchy mid-range, and excellent fuel economy for daily city runs.', price_per_hour: 5.5, price_per_day: 30, image_url: '/assets/bikes/bajaj-pulsar-150.jpg', location: 'Central Station', engine_cc: 149, mileage_kmpl: 45, fuel_type: 'Petrol' },
  { name: 'Bajaj Pulsar 220F', type: 'sports', description: 'A fully-faired street bike with a top-end power boost and aggressive stance, built for riders who want speed with comfort.', price_per_hour: 9.5, price_per_day: 58, image_url: '/assets/bikes/bajaj-pulsar-220f.jpg', location: 'Old Town Station', engine_cc: 220, mileage_kmpl: 35, fuel_type: 'Petrol' },
  { name: 'Honda Unicorn', type: 'commuter', description: 'A smooth, refined commuter known for its comfortable ride quality and low maintenance — ideal for daily office commutes.', price_per_hour: 5, price_per_day: 28, image_url: '/assets/bikes/honda-unicorn.jpg', location: 'Downtown Station', engine_cc: 162, mileage_kmpl: 45, fuel_type: 'Petrol' },
  { name: 'TVS Apache RTR 160', type: 'commuter', description: 'A racing-derived commuter with sharp handling and a race-tuned engine, striking a balance between everyday usability and sport DNA.', price_per_hour: 6, price_per_day: 32, image_url: '/assets/bikes/tvs-apache-rtr-160.jpg', location: 'Riverside Station', engine_cc: 159, mileage_kmpl: 45, fuel_type: 'Petrol' },
  { name: 'TVS Apache RTR 200 4V', type: 'sports', description: 'A track-bred sports bike with ride-by-wire throttle and a slipper clutch, built for spirited rides through twisty roads.', price_per_hour: 10, price_per_day: 60, image_url: '/assets/bikes/tvs-apache-rtr-200-4v.jpg', location: 'Park Station', engine_cc: 197, mileage_kmpl: 40, fuel_type: 'Petrol' },
  { name: 'Yamaha FZ-S FI', type: 'commuter', description: 'A muscular streetfighter-styled commuter with a fuel-injected engine and a compact, agile frame for weaving through traffic.', price_per_hour: 5.5, price_per_day: 29, image_url: '/assets/bikes/yamaha-fz-s-fi.jpg', location: 'Old Town Station', engine_cc: 149, mileage_kmpl: 45, fuel_type: 'Petrol' },
  { name: 'KTM Duke 200', type: 'sports', description: 'A razor-sharp naked sports bike with a trellis frame and punchy single-cylinder engine, built for riders who want raw performance.', price_per_hour: 11, price_per_day: 64, image_url: '/assets/bikes/ktm-duke-200.jpg', location: 'Hillcrest Station', engine_cc: 199, mileage_kmpl: 35, fuel_type: 'Petrol' },
  { name: 'Honda Activa 6G', type: 'scooter', description: 'India\'s best-selling scooter — light, easy to ride, and perfect for quick errands or a first-time rider getting comfortable in traffic.', price_per_hour: 3.5, price_per_day: 20, image_url: '/assets/bikes/honda-activa-6g.jpg', location: 'Downtown Station', engine_cc: 109, mileage_kmpl: 50, fuel_type: 'Petrol' },
  { name: 'TVS Jupiter', type: 'scooter', description: 'A comfortable, feature-loaded scooter with a spacious floorboard and smooth ride, great for city commuting and short trips.', price_per_hour: 3.5, price_per_day: 19, image_url: '/assets/bikes/tvs-jupiter.jpg', location: 'Central Station', engine_cc: 109, mileage_kmpl: 50, fuel_type: 'Petrol' },
  { name: 'Suzuki Access 125', type: 'scooter', description: 'A peppy 125cc scooter with strong acceleration and a roomy seat, offering more punch than a standard commuter scooter.', price_per_hour: 4, price_per_day: 22, image_url: '/assets/bikes/suzuki-access-125.jpg', location: 'Riverside Station', engine_cc: 124, mileage_kmpl: 45, fuel_type: 'Petrol' },
];

function seed() {
  const existingBikeCount = db.prepare('SELECT COUNT(*) AS count FROM bikes').get().count;
  if (existingBikeCount > 0) {
    console.log('Database already seeded — skipping. Delete wheelhouse.db to reseed from scratch.');
    return;
  }

  const insertBike = db.prepare(`
    INSERT INTO bikes (name, type, description, price_per_hour, price_per_day, image_url, location, is_available, engine_cc, mileage_kmpl, fuel_type)
    VALUES (@name, @type, @description, @price_per_hour, @price_per_day, @image_url, @location, 1, @engine_cc, @mileage_kmpl, @fuel_type)
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
  insertBooking.run(demoUserId, 1, '2026-07-10 09:00', '2026-07-10 17:00', 'completed', 62);
  insertBooking.run(demoUserId, 4, '2026-08-20 10:00', '2026-08-20 14:00', 'confirmed', 52);
  console.log('Seeded sample bookings.');

  const insertReview = db.prepare(`
    INSERT INTO reviews (bike_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
  `);
  insertReview.run(1, demoUserId, 5, 'That exhaust note never gets old. Handled the highway stretch beautifully.');
  insertReview.run(4, demoUserId, 4, 'Took it off-road for a day trip — suspension soaked up everything. Seat could be softer.');
  insertReview.run(12, demoUserId, 5, 'Insanely fun in the twisties. Light, fast, and the brakes are confidence-inspiring.');
  console.log('Seeded sample reviews.');
}

seed();
