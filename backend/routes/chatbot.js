const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Meeting = require('../models/Meeting');

const router = express.Router();

// Rate limiter: 60 requests per minute per IP
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
router.use(limiter);

// Hugging Face API key
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

const validateChat = [
  body('message').isString().trim().isLength({ min: 1, max: 4000 }).withMessage('Message is required'),
  body('scope').optional().isIn(['general', 'org', 'auto']).withMessage('Invalid scope'),
  body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
];

router.post('/', validateChat, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user._id;
    const { message, scope = 'auto', limit = 10 } = req.body;

    // If the user explicitly wants org search, run queries
    const doOrgSearch = scope === 'org' || scope === 'auto';

    let orgContext = [];
    if (doOrgSearch) {
      const [clients, projects, meetings] = await Promise.all([
        Client.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
        Project.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
        Meeting.find({ user: userId }).sort({ date: -1 }).limit(limit).lean(),
      ]);
      orgContext = [
        { type: 'clients', data: clients },
        { type: 'projects', data: projects },
        { type: 'meetings', data: meetings },
      ];
    }

    // Build system prompt
    const system = [
      'You are an in-app assistant for a CRM product (SalesForge).',
      'Answer briefly and helpfully. Use bullet points for lists. Maintain a professional, modern tone.',
      'If org data is provided, use it to ground your answer. If something is unknown, state that clearly.',
    ].join(' ');

    // Combine org context as a compressed JSON summary
    const orgSnippet = orgContext.length
      ? `ORG_CONTEXT: ${JSON.stringify(orgContext.map(s => ({ type: s.type, count: s.data.length, sample: s.data.slice(0, 3) })))}`
      : '';

    // Call Hugging Face
    if (!HF_KEY) return res.status(200).json({ answer: 'LLM is not configured. Please set HUGGINGFACE_API_KEY on the server.' });
    const hf = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      { inputs: `${system} ${orgSnippet} USER_QUESTION: ${message}` },
      { headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json', 'X-Wait-For-Model': 'true' }, timeout: 60000 }
    );
    if (hf.data?.error) return res.status(200).json({ answer: `Language model error: ${hf.data.error}`, usedOrgData: !!orgSnippet });
    let text = 'No response';
    if (Array.isArray(hf.data) && hf.data[0]?.generated_text) text = String(hf.data[0].generated_text).trim();
    else if (hf.data?.generated_text) text = String(hf.data.generated_text).trim();
    res.json({ answer: text, usedOrgData: !!orgSnippet });

  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

module.exports = router;


