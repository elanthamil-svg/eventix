const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  toggleBookmark,
  getMyBookmarks,
  getNotifications
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerForEvent);
router.get('/my-registrations', protect, getMyRegistrations);
router.post('/bookmark/toggle', protect, toggleBookmark);
router.get('/bookmarks', protect, getMyBookmarks);
router.get('/notifications', protect, getNotifications);

module.exports = router;
