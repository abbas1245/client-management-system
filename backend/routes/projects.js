const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const Client = require('../models/Client');
const router = express.Router();

// Auth guard - ensure user is authenticated
router.use((req, res, next) => {
  console.log('[projects_auth] Auth guard running...');
  console.log('[projects_auth] req.user:', req.user);
  
  const uid = req.user && (req.user.id || req.user._id);
  if (!uid) {
    console.error('[projects_auth] req.user missing after auth middleware:', req.user);
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  console.log('[projects_auth] User ID found:', uid);
  // Normalize the user ID for downstream use
  req.user.id = uid;
  req.user._id = uid;
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/projects';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'), false);
    }
  }
});

const validateProject = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Project name is required and must be less than 200 characters'),
  body('client_id').isMongoId().withMessage('Valid client is required'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('assigned_to').optional().trim().isLength({ max: 200 }).withMessage('Assigned to must be less than 200 characters'),
  body('status').optional().isIn(['Not Started', 'In Progress', 'On Hold', 'Completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('start_date').optional().isISO8601().toDate().withMessage('Invalid start date'),
  body('due_date').optional().isISO8601().toDate().withMessage('Invalid due date'),
];

// GET /api/projects - list with filters
router.get('/', [
  query('status').optional().isIn(['Not Started', 'In Progress', 'On Hold', 'Completed']),
  query('client').optional().isMongoId(),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  query('sortBy').optional().isIn(['createdAt', 'due_date', 'start_date', 'status', 'priority']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const { status, client, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (client) filter.client_id = client;
    if (priority) filter.priority = priority;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate('client_id', 'name business_name')
      .sort(sort)
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id }).populate('client_id', 'name business_name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create project
router.post('/', upload.array('documents', 10), validateProject, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    // ensure client exists and belongs to current user
    const client = await Client.findOne({ _id: req.body.client_id, user: req.user.id });
    if (!client) return res.status(400).json({ error: 'Client does not exist' });

    // Handle file uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    const projectData = { ...req.body, documents, user: req.user.id };
    const project = new Project(projectData);
    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', upload.array('documents', 10), validateProject, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    if (req.body.client_id) {
      const client = await Client.findOne({ _id: req.body.client_id, user: req.user.id });
      if (!client) return res.status(400).json({ error: 'Client does not exist' });
    }

    // Handle file uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    const updateData = { ...req.body };
    if (documents.length > 0) {
      updateData.documents = documents;
    }

    const project = await Project.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updateData, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// POST upload documents to existing project
router.post('/:id/documents', upload.array('documents', 10), async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newDocuments = [];
    req.files.forEach(file => {
      newDocuments.push({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      });
    });

    project.documents.push(...newDocuments);
    await project.save();

    res.json({ message: 'Documents uploaded successfully', project });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// DELETE document from project
router.delete('/:id/documents/:docId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const document = project.documents.id(req.params.docId);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Remove file from filesystem
    try {
      fs.unlinkSync(document.path);
    } catch (fsError) {
      console.warn('Could not delete file from filesystem:', fsError);
    }

    project.documents.pull(req.params.docId);
    await project.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;


