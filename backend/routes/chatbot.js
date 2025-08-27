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
const OR_KEY = process.env.OPENROUTER_API_KEY;

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
      
      if (!OR_KEY) {
        return res.status(500).json({ answer: 'LLM is not configured. Please set OPENROUTER_API_KEY on the server.' });
      }
  
      // Call OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-chat-v3-0324',
          messages: [
            { role: 'system', content: `${system} ${orgSnippet}` },
            { role: 'user', content: message }
          ],
          max_tokens: 1500
        },
        {
          headers: {
            Authorization: `Bearer ${OR_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
  
      const reply = response.data?.choices?.[0]?.message?.content || 'No response from model';
      res.json({ answer: reply, usedOrgData: !!orgSnippet });
  
    } catch (error) {
      console.error('Chatbot error:', error.response?.data || error.message || error);
      res.status(500).json({ error: 'Failed to get chatbot response' });
    }
});

module.exports = router;


