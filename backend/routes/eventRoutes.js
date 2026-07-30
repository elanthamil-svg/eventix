const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.get('/organizer/my-events', protect, authorizeRoles('organizer', 'admin'), getOrganizerEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorizeRoles('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorizeRoles('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
