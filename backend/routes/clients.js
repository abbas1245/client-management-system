const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const router = express.Router();

// Validation middleware
const validateClient = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('phone').matches(/^[\+]?[\d\s\-\(\)]{7,20}$/).withMessage('Please enter a valid phone number (7-20 characters, can include digits, spaces, dashes, and parentheses)'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('business_name').trim().isLength({ min: 1, max: 200 }).withMessage('Business name is required and must be less than 200 characters'),
  body('business_description').optional().trim().isLength({ max: 1000 }).withMessage('Business description must be less than 1000 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('pitch_status').isIn(['Pending', 'To Be Pitched', 'Cancelled', 'Closed/Won', 'Lost']).withMessage('Invalid pitch status'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('source').optional().isIn(['Referral', 'Website', 'Social Media', 'Cold Call', 'Trade Show', 'Other']).withMessage('Invalid source'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('estimated_value').optional().isNumeric().withMessage('Estimated value must be a number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
];

// GET all clients with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, status, source, priority, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { business_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.pitch_status = status;
    }
    
    if (source && source !== 'all') {
      query.source = source;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const clients = await Client.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Client.countDocuments(query);
    
    res.json({
      clients,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + clients.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// POST create new client
router.post('/', validateClient, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check if email already exists
    const existingClient = await Client.findOne({ email: req.body.email });
    if (existingClient) {
      return res.status(400).json({ error: 'Client with this email already exists' });
    }
    
    const client = new Client(req.body);
    await client.save();
    
    res.status(201).json({
      message: 'Client created successfully',
      client
    });
    
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Client with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT update client
router.put('/:id', validateClient, async (req, res) => {
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
    
    // Check if email is being changed and if it already exists
    if (req.body.email) {
      const existingClient = await Client.findOne({ 
        email: req.body.email, 
        _id: { $ne: id } 
      });
      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }
    
    const client = await Client.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      message: 'Client updated successfully',
      client
    });
    
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      message: 'Client deleted successfully',
      client
    });
    
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// PATCH update client status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'To Be Pitched', 'Cancelled', 'Closed/Won', 'Lost'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { pitch_status: status },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      message: 'Client status updated successfully',
      client
    });
    
  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({ error: 'Failed to update client status' });
  }
});

// GET client statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: '$pitch_status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalClients = await Client.countDocuments();
    const recentClients = await Client.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const statusBreakdown = {};
    stats.forEach(stat => {
      statusBreakdown[stat._id] = stat.count;
    });
    
    res.json({
      total_clients: totalClients,
      recent_clients: recentClients,
      status_breakdown: statusBreakdown
    });
    
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ error: 'Failed to fetch client statistics' });
  }
});

module.exports = router;
