const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getPendingEvents,
  updateEventStatus,
  getUsers,
  updateUserRole,
  getAdminProfile,
  updateAdminProfile
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/pending-events', getPendingEvents);
router.put('/events/:id/status', updateEventStatus);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

// Admin professional profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

module.exports = router;
