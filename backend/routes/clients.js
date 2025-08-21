const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const router = express.Router();

// Auth guard - ensure user is authenticated
router.use((req, res, next) => {
  console.log('[clients_auth] Auth guard running...');
  console.log('[clients_auth] req.user:', req.user);
  
  const uid = req.user && (req.user.id || req.user._id);
  if (!uid) {
    console.error('[clients_auth] req.user missing after auth middleware:', req.user);
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  console.log('[clients_auth] User ID found:', uid);
  // Normalize the user ID for downstream use
  req.user.id = uid;
  req.user._id = uid;
  next();
});

// Validation middleware
const validateClient = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('phone').matches(/^[\+]?[\d\s\-\(\)]{7,20}$/).withMessage('Please enter a valid phone number (7-20 characters, can include digits, spaces, dashes, and parentheses)'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Please enter a valid email'),
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

// Assign specific clients to current user (development only)
router.post('/assign-specific-clients', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }
  
  try {
    console.log('[assign_clients] Starting specific client assignment...');
    console.log('[assign_clients] Current user ID:', req.user.id);
    
    // List of client names to assign
    const clientNames = ['Ali tahir', 'waqas tikka', 'junaid', 'abubakar', 'chup'];
    
    // Find and update these specific clients
    const updatePromises = clientNames.map(async (name) => {
      const result = await Client.updateMany(
        { name: { $regex: new RegExp(name, 'i') } },
        { $set: { user: req.user.id } }
      );
      return { name, updated: result.modifiedCount };
    });
    
    const results = await Promise.all(updatePromises);
    const totalUpdated = results.reduce((sum, result) => sum + result.updated, 0);
    
    console.log('[assign_clients] Assignment results:', results);
    
    // Verify the fix
    const userClients = await Client.find({ user: req.user.id });
    const totalClients = await Client.countDocuments({});
    
    return res.json({
      message: `Assigned ${totalUpdated} specific clients to your account`,
      results: results,
      totalUpdated: totalUpdated,
      userClientsCount: userClients.length,
      totalClients: totalClients,
      currentUser: req.user.id
    });
    
  } catch (error) {
    console.error('[assign_clients] Error assigning specific clients:', error);
    return res.status(500).json({ error: 'Failed to assign specific clients' });
  }
});

// Fix client associations for specific user (development only)
router.post('/fix-client-associations', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }
  
  try {
    console.log('[fix_associations] Starting client association fix...');
    console.log('[fix_associations] Current user ID:', req.user.id);
    
    // Find all clients that don't have a user field or have a different user
    const unassignedClients = await Client.find({
      $or: [
        { user: { $exists: false } },
        { user: { $ne: req.user.id } }
      ]
    });
    
    console.log('[fix_associations] Found unassigned clients:', unassignedClients.length);
    
    if (unassignedClients.length === 0) {
      return res.json({ message: 'No unassigned clients found' });
    }
    
    // Update all unassigned clients to belong to current user
    const updateResult = await Client.updateMany(
      {
        $or: [
          { user: { $exists: false } },
          { user: { $ne: req.user.id } }
        ]
      },
      { $set: { user: req.user.id } }
    );
    
    console.log('[fix_associations] Updated clients:', updateResult.modifiedCount);
    
    // Verify the fix
    const userClients = await Client.find({ user: req.user.id });
    const totalClients = await Client.countDocuments({});
    
    return res.json({
      message: `Fixed ${updateResult.modifiedCount} client associations`,
      updatedCount: updateResult.modifiedCount,
      userClientsCount: userClients.length,
      totalClients: totalClients,
      currentUser: req.user.id
    });
    
  } catch (error) {
    console.error('[fix_associations] Error fixing client associations:', error);
    return res.status(500).json({ error: 'Failed to fix client associations' });
  }
});

// Debug endpoint to see all clients and their user field values
router.get('/debug-all', async (req, res) => {
  try {
    console.log('[clients_debug] Debug endpoint called');
    console.log('[clients_debug] Current user ID:', req.user.id);
    
    // Get ALL clients without user filter
    const allClients = await Client.find({}).lean();
    console.log('[clients_debug] Total clients in database:', allClients.length);
    
    // Get clients for current user
    const userClients = await Client.find({ user: req.user.id }).lean();
    console.log('[clients_debug] Clients for current user:', userClients.length);
    
    // Show sample of all clients with their user field
    const sampleClients = allClients.slice(0, 10).map(client => ({
      id: client._id,
      name: client.name,
      business_name: client.business_name,
      user: client.user,
      userId: client.userId,
      email: client.email,
      createdAt: client.createdAt
    }));
    
    // Count clients by user field
    const userFieldCounts = {};
    allClients.forEach(client => {
      const userField = client.user || client.userId || 'no_user_field';
      userFieldCounts[userField] = (userFieldCounts[userField] || 0) + 1;
    });
    
    res.json({
      debug: true,
      currentUser: req.user.id,
      totalClients: allClients.length,
      userClients: userClients.length,
      sampleClients: sampleClients,
      userFieldCounts: userFieldCounts,
      message: 'Debug information for clients'
    });
    
  } catch (error) {
    console.error('[clients_debug] Error:', error);
    res.status(500).json({ error: 'Failed to get debug info' });
  }
});

// GET all clients with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, status, source, priority, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query scoped to current user
    let query = { user: req.user.id };
    
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
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    
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
    // Normalize empty email to undefined so Mongoose validators are skipped
    if (typeof req.body.email === 'string' && req.body.email.trim() === '') {
      delete req.body.email;
    }
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check if email already exists (only when provided)
    if (req.body.email) {
      const existingClient = await Client.findOne({ email: req.body.email, user: req.user.id });
      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }
    
    const client = new Client({ ...req.body, user: req.user.id });
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
    // Normalize empty email to undefined
    if (typeof req.body.email === 'string' && req.body.email.trim() === '') {
      delete req.body.email;
    }
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
        user: req.user.id,
        _id: { $ne: id } 
      });
      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }
    
    const client = await Client.findOneAndUpdate(
      { _id: id, user: req.user.id },
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
    const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
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
    
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
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
        $match: { user: req.user.id }
      },
      {
        $group: { _id: '$pitch_status', count: { $sum: 1 } }
      }
    ]);
    
    const totalClients = await Client.countDocuments({ user: req.user.id });
    const recentClients = await Client.countDocuments({
      user: req.user.id,
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
