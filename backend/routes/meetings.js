const express = require('express');
const { body, validationResult } = require('express-validator');
const Meeting = require('../models/Meeting');
const Client = require('../models/Client');
const router = express.Router();

// Validation middleware
const validateMeeting = [
  body('client_id').isMongoId().withMessage('Valid client ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('type').optional().isIn(['Initial Consultation', 'Follow-up', 'Pitch', 'Demo', 'Negotiation', 'Closing', 'Other']).withMessage('Invalid meeting type'),
  body('status').optional().isIn(['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled']).withMessage('Invalid status'),
  body('location').optional().trim().isLength({ max: 500 }).withMessage('Location must be less than 500 characters'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters'),
  body('agenda').optional().isArray().withMessage('Agenda must be an array'),
  body('attendees').optional().isArray().withMessage('Attendees must be an array'),
  body('reminder.enabled').optional().isBoolean().withMessage('Reminder enabled must be a boolean'),
  body('reminder.minutes_before').optional().isInt({ min: 1, max: 1440 }).withMessage('Reminder must be between 1 and 1440 minutes'),
  body('outcome').optional().isIn(['Successful', 'Needs Follow-up', 'Rescheduled', 'Cancelled', 'No Show']).withMessage('Invalid outcome'),
  body('follow_up_required').optional().isBoolean().withMessage('Follow-up required must be a boolean'),
  body('follow_up_date').optional().isISO8601().withMessage('Valid follow-up date required'),
  body('follow_up_notes').optional().trim().isLength({ max: 1000 }).withMessage('Follow-up notes must be less than 1000 characters')
];

// GET all meetings with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      client_id, 
      status, 
      type, 
      date_from, 
      date_to, 
      page = 1, 
      limit = 20, 
      sortBy = 'date', 
      sortOrder = 'asc' 
    } = req.query;
    
    // Build query
    let query = {};
    
    if (client_id) {
      query.client_id = client_id;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (date_from || date_to) {
      query.date = {};
      if (date_from) query.date.$gte = new Date(date_from);
      if (date_to) query.date.$lte = new Date(date_to);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const meetings = await Meeting.find(query)
      .populate('client_id', 'name business_name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Meeting.countDocuments(query);
    
    res.json({
      meetings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + meetings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// GET single meeting by ID
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('client_id', 'name business_name email phone address');
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// POST create new meeting
router.post('/', validateMeeting, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check if client exists
    const client = await Client.findById(req.body.client_id);
    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }
    
    // Check if meeting date is in the past
    const meetingDate = new Date(req.body.date);
    if (meetingDate < new Date()) {
      return res.status(400).json({ error: 'Meeting date cannot be in the past' });
    }
    
    const meeting = new Meeting(req.body);
    await meeting.save();
    
    // Populate client info for response
    await meeting.populate('client_id', 'name business_name email');
    
    res.status(201).json({
      message: 'Meeting scheduled successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

// PUT update meeting
router.put('/:id', validateMeeting, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { id } = req.params;
    
    // Check if meeting exists
    const existingMeeting = await Meeting.findById(id);
    if (!existingMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if client exists
    if (req.body.client_id) {
      const client = await Client.findById(req.body.client_id);
      if (!client) {
        return res.status(400).json({ error: 'Client not found' });
      }
    }
    
    // Check if meeting date is in the past
    if (req.body.date) {
      const meetingDate = new Date(req.body.date);
      if (meetingDate < new Date()) {
        return res.status(400).json({ error: 'Meeting date cannot be in the past' });
      }
    }
    
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client_id', 'name business_name email');
    
    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// DELETE meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.json({
      message: 'Meeting deleted successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// PATCH update meeting status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('client_id', 'name business_name email');
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.json({
      message: 'Meeting status updated successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ error: 'Failed to update meeting status' });
  }
});

// PATCH reschedule meeting
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }
    
    // Check if new date is in the past
    const newDate = new Date(date);
    if (newDate < new Date()) {
      return res.status(400).json({ error: 'Meeting date cannot be in the past' });
    }
    
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { 
        date: newDate, 
        time, 
        status: 'Rescheduled' 
      },
      { new: true }
    ).populate('client_id', 'name business_name email');
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.json({
      message: 'Meeting rescheduled successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Error rescheduling meeting:', error);
    res.status(500).json({ error: 'Failed to reschedule meeting' });
  }
});

// GET upcoming meetings
router.get('/upcoming/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const meetings = await Meeting.find({
      date: { $gte: new Date() },
      status: { $in: ['Scheduled', 'Confirmed'] }
    })
    .populate('client_id', 'name business_name email')
    .sort({ date: 1, time: 1 })
    .limit(parseInt(limit))
    .lean();
    
    res.json(meetings);
    
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
  }
});

// GET meetings by client
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const meetings = await Meeting.find({ client_id: clientId })
      .sort({ date: -1, time: -1 })
      .lean();
    
    res.json(meetings);
    
  } catch (error) {
    console.error('Error fetching client meetings:', error);
    res.status(500).json({ error: 'Failed to fetch client meetings' });
  }
});

// GET meeting statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const stats = await Meeting.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          typeBreakdown: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          monthlyMeetings: [
            {
              $match: {
                date: { $gte: startOfMonth, $lte: endOfMonth }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } }
          ],
          upcomingMeetings: [
            {
              $match: {
                date: { $gte: today },
                status: { $in: ['Scheduled', 'Confirmed'] }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    const totalMeetings = await Meeting.countDocuments();
    
    const statusBreakdown = {};
    stats[0].statusBreakdown.forEach(stat => {
      statusBreakdown[stat._id] = stat.count;
    });
    
    const typeBreakdown = {};
    stats[0].typeBreakdown.forEach(stat => {
      typeBreakdown[stat._id] = stat.count;
    });
    
    res.json({
      total_meetings: totalMeetings,
      monthly_meetings: stats[0].monthlyMeetings[0]?.count || 0,
      upcoming_meetings: stats[0].upcomingMeetings[0]?.count || 0,
      status_breakdown: statusBreakdown,
      type_breakdown: typeBreakdown
    });
    
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    res.status(500).json({ error: 'Failed to fetch meeting statistics' });
  }
});

module.exports = router;
