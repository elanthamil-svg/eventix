const Event = require('../models/Event');
const { SEED_EVENTS } = require('./aiController');

// @desc    Get all events with search, filtering, and sorting
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, college, search, fee, featured, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (college && college !== 'All') {
      query.collegeName = { $regex: college, $options: 'i' };
    }

    if (fee === 'free') {
      query.entryFee = 0;
    } else if (fee === 'paid') {
      query.entryFee = { $gt: 0 };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let events = [];
    try {
      events = await Event.find(query).sort({ eventDate: 1 });
    } catch (_dbErr) {}

    if (!events || events.length === 0) {
      events = SEED_EVENTS || [];
    }

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.json({ success: true, count: (SEED_EVENTS || []).length, data: SEED_EVENTS || [] });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    let event = null;
    try {
      event = await Event.findById(req.params.id);
    } catch (_dbErr) {}

    if (!event) {
      event = (SEED_EVENTS || []).find(e => (e._id || e.id)?.toString() === req.params.id?.toString());
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Increment views if DB document
    if (typeof event.save === 'function') {
      event.viewsCount = (event.viewsCount || 0) + 1;
      await event.save().catch(() => {});
    }

    res.json({ success: true, data: event });
  } catch (error) {
    const fallback = (SEED_EVENTS || []).find(e => (e._id || e.id)?.toString() === req.params.id?.toString()) || (SEED_EVENTS || [])[0];
    if (fallback) {
      return res.json({ success: true, data: fallback });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new event (Admin / Organizer)
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const body = req.body;
    const eventData = {
      // Defaults for fields not present in the simplified admin form
      poster: body.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      collegeName: body.collegeName || req.user.college || 'Eventix Admin',
      registrationDeadline: body.registrationDeadline || body.eventDate || new Date(),
      startTime: body.startTime || '09:00 AM',
      endTime: body.endTime || '06:00 PM',
      contactPerson: body.contactPerson || {
        name: req.user.name || 'Admin',
        phone: '',
        email: req.user.email || ''
      },
      location: body.location || {
        address: body.venue || '',
        city: body.venue || '',
        lat: 0,
        lng: 0
      },
      // Spread the rest (overrides defaults if provided)
      ...body,
      organizer: req.user._id,
      organizerName: req.user.name || 'Admin'
    };

    const newEvent = await Event.create(eventData);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update event (Organizer / Admin)
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get organizer created events
// @route   GET /api/events/organizer/my-events
exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
