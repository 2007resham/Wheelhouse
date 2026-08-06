require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const bikesRoutes = require('./routes/bikes.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

require('./db'); // ensures schema exists before the server starts accepting requests

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikesRoutes);
app.use('/api/bookings', bookingsRoutes);

app.use(express.static(path.join(__dirname, '..', 'client')));

app.use('/api', notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`WheelHouse server running at http://localhost:${PORT}`);
});
