const Registration = require('../models/Registration');
const Bookmark = require('../models/Bookmark');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Register for an event
// @route   POST /api/registrations
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, teamName, teamMembersCount } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const existingReg = await Registration.findOne({ student: req.user._id, event: eventId });
    if (existingReg) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    const registration = await Registration.create({
      student: req.user._id,
      event: eventId,
      teamName: teamName || '',
      teamMembersCount: teamMembersCount || 1
    });

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: 'Registration Confirmed 🎉',
      message: `You have successfully registered for ${event.title}.`,
      type: 'registration',
      link: `/events/${event._id}`
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's registrations
// @route   GET /api/registrations/my-registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event')
      .sort({ registeredAt: -1 });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Bookmark
// @route   POST /api/bookmarks/toggle
exports.toggleBookmark = async (req, res) => {
  try {
    const { eventId } = req.body;

    const existingBookmark = await Bookmark.findOne({ user: req.user._id, event: eventId });

    if (existingBookmark) {
      await existingBookmark.deleteOne();
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ user: req.user._id, event: eventId });
      return res.json({ success: true, bookmarked: true, message: 'Event bookmarked' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student bookmarks
// @route   GET /api/bookmarks
exports.getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate('event');
    res.json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get notifications for user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
