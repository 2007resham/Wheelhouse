const bookingModel = require('../models/booking.model');
const bikeModel = require('../models/bike.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

function calculateTotalPrice(startTime, endTime, bike) {
  const durationMs = new Date(endTime) - new Date(startTime);
  const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours - fullDays * 24;
  return Math.round((fullDays * bike.price_per_day + remainingHours * bike.price_per_hour) * 100) / 100;
}

const create = asyncHandler(async (req, res) => {
  const { bikeId, startTime, endTime } = req.body;
  if (!bikeId || !startTime || !endTime) throw new ApiError(400, 'bikeId, startTime, and endTime are required');

  const bike = bikeModel.getById(Number(bikeId));
  if (!bike) throw new ApiError(404, 'Bike not found');
  if (!bike.is_available) throw new ApiError(409, 'This bike is not currently available');

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new ApiError(400, 'Invalid start or end time');
  if (end <= start) throw new ApiError(400, 'endTime must be after startTime');
  if (start < new Date()) throw new ApiError(400, 'startTime cannot be in the past');

  const totalPrice = calculateTotalPrice(startTime, endTime, bike);
  const booking = bookingModel.create({
    userId: req.user.id,
    bikeId: bike.id,
    startTime,
    endTime,
    totalPrice,
  });

  res.status(201).json({ booking });
});

const listMine = asyncHandler(async (req, res) => {
  const bookings = bookingModel.getByUser(req.user.id);
  res.json({ bookings });
});

const listAll = asyncHandler(async (req, res) => {
  res.json({ bookings: bookingModel.getAll(), stats: bookingModel.getStats() });
});

const cancel = asyncHandler(async (req, res) => {
  const booking = bookingModel.cancel(Number(req.params.id), req.user.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json({ booking });
});

module.exports = { create, listMine, listAll, cancel };
