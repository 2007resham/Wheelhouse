const reviewModel = require('../models/review.model');
const bikeModel = require('../models/bike.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const list = asyncHandler(async (req, res) => {
  const bikeId = Number(req.params.id);
  const bike = bikeModel.getById(bikeId);
  if (!bike) throw new ApiError(404, 'Bike not found');
  res.json({ reviews: reviewModel.getByBike(bikeId) });
});

const create = asyncHandler(async (req, res) => {
  const bikeId = Number(req.params.id);
  const bike = bikeModel.getById(bikeId);
  if (!bike) throw new ApiError(404, 'Bike not found');

  const { rating, comment } = req.body;
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'rating must be an integer between 1 and 5');
  }

  const review = reviewModel.create({ bikeId, userId: req.user.id, rating: numericRating, comment });
  res.status(201).json({ review });
});

module.exports = { list, create };
