const bikeModel = require('../models/bike.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const BIKE_TYPES = ['city', 'mountain', 'electric'];

function parseBikePayload(body) {
  const { name, type, description, price_per_hour, price_per_day, image_url, location, is_available } = body;

  if (!name || !name.trim()) throw new ApiError(400, 'Bike name is required');
  if (!BIKE_TYPES.includes(type)) throw new ApiError(400, `Type must be one of: ${BIKE_TYPES.join(', ')}`);
  if (!description || !description.trim()) throw new ApiError(400, 'Description is required');
  if (typeof price_per_hour !== 'number' || price_per_hour <= 0) throw new ApiError(400, 'price_per_hour must be a positive number');
  if (typeof price_per_day !== 'number' || price_per_day <= 0) throw new ApiError(400, 'price_per_day must be a positive number');
  if (!image_url || !image_url.trim()) throw new ApiError(400, 'image_url is required');
  if (!location || !location.trim()) throw new ApiError(400, 'location is required');

  return {
    name: name.trim(),
    type,
    description: description.trim(),
    price_per_hour,
    price_per_day,
    image_url: image_url.trim(),
    location: location.trim(),
    is_available: is_available === undefined ? 1 : is_available ? 1 : 0,
  };
}

const list = asyncHandler(async (req, res) => {
  const { type, minPrice, maxPrice, location, search, sort } = req.query;
  const bikes = bikeModel.getAll({
    type: type || undefined,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    location: location || undefined,
    search: search || undefined,
    sort: sort || undefined,
  });
  res.json({ bikes, locations: bikeModel.getLocations() });
});

const getOne = asyncHandler(async (req, res) => {
  const bike = bikeModel.getById(Number(req.params.id));
  if (!bike) throw new ApiError(404, 'Bike not found');
  res.json({ bike });
});

const create = asyncHandler(async (req, res) => {
  const payload = parseBikePayload(req.body);
  const bike = bikeModel.create(payload);
  res.status(201).json({ bike });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = bikeModel.getById(id);
  if (!existing) throw new ApiError(404, 'Bike not found');
  const payload = parseBikePayload({ ...existing, ...req.body });
  const bike = bikeModel.update(id, payload);
  res.json({ bike });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = bikeModel.remove(Number(req.params.id));
  if (!deleted) throw new ApiError(404, 'Bike not found');
  res.status(204).send();
});

module.exports = { list, getOne, create, update, remove };
