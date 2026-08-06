const express = require('express');
const bookingsController = require('../controllers/bookings.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', requireAuth, bookingsController.create);
router.get('/me', requireAuth, bookingsController.listMine);
router.get('/', requireAuth, requireAdmin, bookingsController.listAll);
router.delete('/:id', requireAuth, bookingsController.cancel);

module.exports = router;
