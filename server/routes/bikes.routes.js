const express = require('express');
const bikesController = require('../controllers/bikes.controller');
const reviewsController = require('../controllers/reviews.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', bikesController.list);
router.get('/:id', bikesController.getOne);
router.post('/', requireAuth, requireAdmin, bikesController.create);
router.put('/:id', requireAuth, requireAdmin, bikesController.update);
router.delete('/:id', requireAuth, requireAdmin, bikesController.remove);

router.get('/:id/reviews', reviewsController.list);
router.post('/:id/reviews', requireAuth, reviewsController.create);

module.exports = router;
