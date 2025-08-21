import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { info } from '../lib/logger';
import { auth } from '../middleware/auth';
import { Intent, detectIntent, extractClientName } from '../chat/intents';
import { resolveClientAddress, resolveLeadsThisWeek, resolveLeadStatus, resolveProjectToday } from '../chat/resolvers';
import axios from 'axios';
import config from '../../config/env';
import mongoose from 'mongoose';

// Import the legacy JavaScript models for proper data access
const Client = require('../../models/Client');
const Project = require('../../models/Project');
const Meeting = require('../../models/Meeting');
// Import Lead from the TypeScript models directory
import Lead from '../models/Lead';

const router = Router();

// Helper function to get real CRM data using proper Mongoose models
async function getCRMData(query: string, userId: string): Promise<string | null> {
  const lowerQuery = query.toLowerCase();
  
  try {
    // IMPORTANT: This function ONLY returns data for the specified user
    // It will NEVER show data from other accounts or users
    console.log('[getCRMData] Getting CRM data for user ID:', userId);
    
    // Check for client-related queries
    if (lowerQuery.includes('client') || lowerQuery.includes('customer')) {
      if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
        console.log('[getCRMData] Counting clients for user:', userId);
        
        // Use the proper Client model with user field
        const clientCount = await Client.countDocuments({ user: userId });
        console.log(`[getCRMData] Clients found for user ${userId}: ${clientCount}`);
        
        return `You have ${clientCount} clients in your CRM system.`;
      }
      
      // Handle detailed client information queries
      if (lowerQuery.includes('details') || lowerQuery.includes('information') || lowerQuery.includes('info') || lowerQuery.includes('full details')) {
        console.log('[getCRMData] Getting detailed client information for user:', userId);
        const clients = await Client.find({ user: userId }).limit(10).lean();
        
        if (clients.length === 0) return 'You have no clients in your CRM system.';
        
        let detailedInfo = '**Your Client Details:**\n\n';
        clients.forEach((client: any, index: number) => {
          detailedInfo += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          detailedInfo += `• **Full Name:** ${client.name || 'Not provided'}\n`;
          detailedInfo += `• **Phone Number:** ${client.phone || 'Not provided'}\n`;
          detailedInfo += `• **Email Address:** ${client.email || 'Not provided'}\n`;
          detailedInfo += `• **Business Name:** ${client.business_name || 'Not provided'}\n`;
          detailedInfo += `• **Pitch Status:** ${client.pitch_status || 'Not set'}\n`;
          detailedInfo += `• **Business Address:** ${client.address || client.business_address || 'Not provided'}\n`;
          detailedInfo += `• **Business Description:** ${client.description || client.business_description || 'Not provided'}\n\n`;
        });
        
        if (clients.length >= 10) {
          detailedInfo += `*Showing first 10 clients. You have ${clients.length} total clients.*`;
        }
        
        return detailedInfo;
      }
      
      // Handle specific client status queries
      if (lowerQuery.includes('pending') || lowerQuery.includes('pending clients')) {
        console.log('[getCRMData] Counting pending clients for user:', userId);
        const pendingCount = await Client.countDocuments({ user: userId, pitch_status: 'Pending' });
        return `You have ${pendingCount} pending clients in your CRM system.`;
      }
      
      if (lowerQuery.includes('lost') || lowerQuery.includes('lost clients')) {
        console.log('[getCRMData] Counting lost clients for user:', userId);
        const lostCount = await Client.countDocuments({ user: userId, pitch_status: 'Lost' });
        return `You have ${lostCount} lost clients in your CRM system.`;
      }
      
      if (lowerQuery.includes('canceled') || lowerQuery.includes('cancelled') || lowerQuery.includes('canceled clients')) {
        console.log('[getCRMData] Counting canceled clients for user:', userId);
        const canceledCount = await Client.countDocuments({ user: userId, pitch_status: 'Cancelled' });
        return `You have ${canceledCount} canceled clients in your CRM system.`;
      }
      
      if (lowerQuery.includes('to be pitched') || lowerQuery.includes('to be pitched clients') || lowerQuery.includes('tbp')) {
        console.log('[getCRMData] Counting to be pitched clients for user:', userId);
        const tbpCount = await Client.countDocuments({ user: userId, pitch_status: 'To Be Pitched' });
        return `You have ${tbpCount} clients to be pitched in your CRM system.`;
      }
      
      if (lowerQuery.includes('closed') || lowerQuery.includes('won') || lowerQuery.includes('closed/won') || lowerQuery.includes('closed won')) {
        console.log('[getCRMData] Counting closed/won clients for user:', userId);
        const wonCount = await Client.countDocuments({ user: userId, pitch_status: 'Closed/Won' });
        return `You have ${wonCount} closed/won clients in your CRM system.`;
      }
      
      if (lowerQuery.includes('status') || lowerQuery.includes('client status') || lowerQuery.includes('all status')) {
        console.log('[getCRMData] Getting client status breakdown for user:', userId);
        
        const pendingCount = await Client.countDocuments({ user: userId, pitch_status: 'Pending' });
        const lostCount = await Client.countDocuments({ user: userId, pitch_status: 'Lost' });
        const canceledCount = await Client.countDocuments({ user: userId, pitch_status: 'Cancelled' });
        const tbpCount = await Client.countDocuments({ user: userId, pitch_status: 'To Be Pitched' });
        const wonCount = await Client.countDocuments({ user: userId, pitch_status: 'Closed/Won' });
        
        return `Your client status breakdown:\n• Pending: ${pendingCount}\n• To Be Pitched: ${tbpCount}\n• Closed/Won: ${wonCount}\n• Lost: ${lostCount}\n• Canceled: ${canceledCount}`;
      }
      
      // List clients by specific status with details
      if (lowerQuery.includes('list pending') || lowerQuery.includes('show pending')) {
        console.log('[getCRMData] Listing pending clients for user:', userId);
        const pendingClients = await Client.find({ user: userId, pitch_status: 'Pending' }).limit(5).lean();
        
        if (pendingClients.length === 0) return 'You have no pending clients.';
        
        let clientList = '**Your Pending Clients:**\n\n';
        pendingClients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        return clientList;
      }
      
      if (lowerQuery.includes('list lost') || lowerQuery.includes('show lost')) {
        console.log('[getCRMData] Listing lost clients for user:', userId);
        const lostClients = await Client.find({ user: userId, pitch_status: 'Lost' }).limit(5).lean();
        
        if (lostClients.length === 0) return 'You have no lost clients.';
        
        let clientList = '**Your Lost Clients:**\n\n';
        lostClients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        return clientList;
      }
      
      if (lowerQuery.includes('list canceled') || lowerQuery.includes('show canceled') || lowerQuery.includes('list cancelled') || lowerQuery.includes('show cancelled')) {
        console.log('[getCRMData] Listing canceled clients for user:', userId);
        const canceledClients = await Client.find({ user: userId, pitch_status: 'Cancelled' }).limit(5).lean();
        
        if (canceledClients.length === 0) return 'You have no canceled clients.';
        
        let clientList = '**Your Canceled Clients:**\n\n';
        canceledClients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        return clientList;
      }
      
      if (lowerQuery.includes('list to be pitched') || lowerQuery.includes('show to be pitched') || lowerQuery.includes('list tbp') || lowerQuery.includes('show tbp')) {
        console.log('[getCRMData] Listing to be pitched clients for user:', userId);
        const tbpClients = await Client.find({ user: userId, pitch_status: 'To Be Pitched' }).limit(5).lean();
        
        if (tbpClients.length === 0) return 'You have no clients to be pitched.';
        
        let clientList = '**Your Clients To Be Pitched:**\n\n';
        tbpClients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        return clientList;
      }
      
      if (lowerQuery.includes('list won') || lowerQuery.includes('show won') || lowerQuery.includes('list closed') || lowerQuery.includes('show closed')) {
        console.log('[getCRMData] Listing closed/won clients for user:', userId);
        const wonClients = await Client.find({ user: userId, pitch_status: 'Closed/Won' }).limit(5).lean();
        
        if (wonClients.length === 0) return 'You have no closed/won clients.';
        
        let clientList = '**Your Closed/Won Clients:**\n\n';
        wonClients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        return clientList;
      }
      
      if (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all')) {
        console.log('[getCRMData] Listing clients for user:', userId);
        
        // Use the proper Client model with user field
        const clients = await Client.find({ user: userId }).limit(5).lean();
        console.log(`[getCRMData] Found ${clients.length} clients for user ${userId}`);
        
        if (clients.length === 0) return 'You have no clients in your CRM system.';
        
        let clientList = '**Your Clients:**\n\n';
        clients.forEach((client: any, index: number) => {
          clientList += `**${index + 1}. ${client.name || client.business_name || 'Unnamed Client'}**\n`;
          clientList += `• Phone: ${client.phone || 'Not provided'}\n`;
          clientList += `• Email: ${client.email || 'Not provided'}\n`;
          clientList += `• Business: ${client.business_name || 'Not provided'}\n`;
          clientList += `• Status: ${client.pitch_status || 'Not set'}\n`;
          clientList += `• Address: ${client.address || 'Not provided'}\n\n`;
        });
        
        if (clients.length >= 5) {
          clientList += `*Showing first 5 clients. You have ${clients.length} total clients.*`;
        }
        
        return clientList;
      }
    }

    // Check for project-related queries
    if (lowerQuery.includes('project')) {
      if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
        console.log('[getCRMData] Counting projects for user:', userId);
        
        // Use the proper Project model with user field
        const projectCount = await Project.countDocuments({ user: userId });
        console.log(`[getCRMData] Projects found for user ${userId}: ${projectCount}`);
        
        return `You have ${projectCount} projects in your CRM system.`;
      }
      
      // Handle specific project status queries
      if (lowerQuery.includes('started') || lowerQuery.includes('started projects')) {
        console.log('[getCRMData] Counting started projects for user:', userId);
        const startedCount = await Project.countDocuments({ user: userId, status: 'Started' });
        return `You have ${startedCount} started projects in your CRM system.`;
      }
      
      if (lowerQuery.includes('in progress') || lowerQuery.includes('progress') || lowerQuery.includes('in progress projects')) {
        console.log('[getCRMData] Counting in progress projects for user:', userId);
        const inProgressCount = await Project.countDocuments({ user: userId, status: 'In Progress' });
        return `You have ${inProgressCount} in progress projects in your CRM system.`;
      }
      
      if (lowerQuery.includes('on hold') || lowerQuery.includes('hold') || lowerQuery.includes('on hold projects')) {
        console.log('[getCRMData] Counting on hold projects for user:', userId);
        const onHoldCount = await Project.countDocuments({ user: userId, status: 'On Hold' });
        return `You have ${onHoldCount} on hold projects in your CRM system.`;
      }
      
      if (lowerQuery.includes('completed') || lowerQuery.includes('completed projects')) {
        console.log('[getCRMData] Counting completed projects for user:', userId);
        const completedCount = await Project.countDocuments({ user: userId, status: 'Completed' });
        return `You have ${completedCount} completed projects in your CRM system.`;
      }
      
      if (lowerQuery.includes('status') || lowerQuery.includes('project status') || lowerQuery.includes('all status')) {
        console.log('[getCRMData] Getting project status breakdown for user:', userId);
        
        const startedCount = await Project.countDocuments({ user: userId, status: 'Started' });
        const inProgressCount = await Project.countDocuments({ user: userId, status: 'In Progress' });
        const onHoldCount = await Project.countDocuments({ user: userId, status: 'On Hold' });
        const completedCount = await Project.countDocuments({ user: userId, status: 'Completed' });
        
        return `Your project status breakdown:\n• Started: ${startedCount}\n• In Progress: ${inProgressCount}\n• On Hold: ${onHoldCount}\n• Completed: ${completedCount}`;
      }
      
      // List projects by specific status
      if (lowerQuery.includes('list started') || lowerQuery.includes('show started')) {
        console.log('[getCRMData] Listing started projects for user:', userId);
        const startedProjects = await Project.find({ user: userId, status: 'Started' }).limit(5).lean();
        
        if (startedProjects.length === 0) return 'You have no started projects.';
        
        const projectList = startedProjects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your started projects: ${projectList}${startedProjects.length >= 5 ? '... (showing first 5)' : ''}`;
      }
      
      if (lowerQuery.includes('list in progress') || lowerQuery.includes('show in progress') || lowerQuery.includes('list progress') || lowerQuery.includes('show progress')) {
        console.log('[getCRMData] Listing in progress projects for user:', userId);
        const inProgressProjects = await Project.find({ user: userId, status: 'In Progress' }).limit(5).lean();
        
        if (inProgressProjects.length === 0) return 'You have no in progress projects.';
        
        const projectList = inProgressProjects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your in progress projects: ${projectList}${inProgressProjects.length >= 5 ? '... (showing first 5)' : ''}`;
      }
      
      if (lowerQuery.includes('list on hold') || lowerQuery.includes('show on hold') || lowerQuery.includes('list hold') || lowerQuery.includes('show hold')) {
        console.log('[getCRMData] Listing on hold projects for user:', userId);
        const onHoldProjects = await Project.find({ user: userId, status: 'On Hold' }).limit(5).lean();
        
        if (onHoldProjects.length === 0) return 'You have no on hold projects.';
        
        const projectList = onHoldProjects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your on hold projects: ${projectList}${onHoldProjects.length >= 5 ? '... (showing first 5)' : ''}`;
      }
      
      if (lowerQuery.includes('list completed') || lowerQuery.includes('show completed')) {
        console.log('[getCRMData] Listing completed projects for user:', userId);
        const completedProjects = await Project.find({ user: userId, status: 'Completed' }).limit(5).lean();
        
        if (completedProjects.length === 0) return 'You have no completed projects.';
        
        const projectList = completedProjects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your completed projects: ${projectList}${completedProjects.length >= 5 ? '... (showing first 5)' : ''}`;
      }
      
      if (lowerQuery.includes('due') || lowerQuery.includes('today') || lowerQuery.includes('upcoming')) {
        const today = new Date();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        // Use the proper Project model with user field
        const dueProjects = await Project.find({
          user: userId,
          dueDate: { $lte: endOfDay }
        }).limit(3).lean();
        
        console.log(`[getCRMData] Found ${dueProjects.length} due projects for user ${userId}`);
        
        if (dueProjects.length === 0) return 'You have no projects due today.';
        
        const projectList = dueProjects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your projects due today: ${projectList}${dueProjects.length >= 3 ? '... (showing first 3)' : ''}`;
      }
      
      // List all projects
      if (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all')) {
        console.log('[getCRMData] Listing all projects for user:', userId);
        
        // Use the proper Project model with user field
        const projects = await Project.find({ user: userId }).limit(5).lean();
        console.log(`[getCRMData] Found ${projects.length} projects for user ${userId}`);
        
        if (projects.length === 0) return 'You have no projects in your CRM system.';
        
        const projectList = projects.map((p: any) => p.name || p.title || 'Unnamed Project').join(', ');
        return `Your projects: ${projectList}${projects.length >= 5 ? '... (showing first 5)' : ''}`;
      }
    }

    // Check for meeting-related queries
    if (lowerQuery.includes('meeting')) {
      if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
        console.log('[getCRMData] Counting meetings for user:', userId);
        
        // Use the proper Meeting model with user field
        const meetingCount = await Meeting.countDocuments({ user: userId });
        console.log(`[getCRMData] Meetings found for user ${userId}: ${meetingCount}`);
        
        return `You have ${meetingCount} meetings in your CRM system.`;
      }
      
      if (lowerQuery.includes('today') || lowerQuery.includes('upcoming')) {
        const today = new Date();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        // Use the proper Meeting model with user field
        const todayMeetings = await Meeting.find({
          user: userId,
          date: { $gte: today, $lte: endOfDay }
        }).limit(3).lean();
        
        console.log(`[getCRMData] Found ${todayMeetings.length} today meetings for user ${userId}`);
        
        if (todayMeetings.length === 0) return 'You have no meetings scheduled for today.';
        
        const meetingList = todayMeetings.map((m: any) => m.title || m.subject || 'Unnamed Meeting').join(', ');
        return `Your meetings today: ${meetingList}${todayMeetings.length >= 3 ? '... (showing first 3)' : ''}`;
      }
    }

    // Check for lead-related queries
    if (lowerQuery.includes('lead')) {
      if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
        console.log('[getCRMData] Counting leads for user:', userId);
        
        // Use the proper Lead model with user field
        const leadCount = await Lead.countDocuments({ user: userId });
        console.log(`[getCRMData] Leads found for user ${userId}: ${leadCount}`);
        
        return `You have ${leadCount} leads in your CRM system.`;
      }
    }

    // Check for general statistics
    if (lowerQuery.includes('statistics') || lowerQuery.includes('stats') || lowerQuery.includes('summary')) {
      console.log('[getCRMData] Getting statistics for user:', userId);
      
      // Use proper models for accurate counts
      const clientCount = await Client.countDocuments({ user: userId });
      const projectCount = await Project.countDocuments({ user: userId });
      const meetingCount = await Meeting.countDocuments({ user: userId });
      const leadCount = await Lead.countDocuments({ user: userId });
      
      console.log(`[getCRMData] Statistics for user ${userId}: ${clientCount} clients, ${projectCount} projects, ${meetingCount} meetings, ${leadCount} leads`);
      
      return `Your CRM Summary: ${clientCount} clients, ${projectCount} projects, ${meetingCount} meetings, ${leadCount} leads.`;
    }

    return null;
  } catch (error) {
    console.error('[getCRMData] Error:', error);
    return null;
  }
}

// Test endpoint to check OpenRouter API
router.get('/test-openrouter', auth, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || config.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.json({ error: 'No OpenRouter API key found', key: 'missing' });
    }

    console.log('[test-openrouter] Testing with API key:', apiKey.substring(0, 10) + '...');
    
    // Test with DeepSeek model
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful business assistant for a CRM system.'
          },
          {
            role: 'user',
            content: 'Hello, how are you?'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CRM Assistant'
        },
        timeout: 15000
      }
    );

    return res.json({ 
      success: true, 
      model: 'deepseek/deepseek-chat-v3-0324',
      response: response.data,
      message: 'OpenRouter API is working!'
    });

  } catch (error: any) {
    console.error('[test-openrouter] Error:', error?.response?.status, error?.message);
    return res.json({ 
      error: true, 
      status: error?.response?.status,
      message: error?.message,
      details: error?.response?.data
    });
  }
});

router.post(
  '/chat',
  auth,
  [
    body('message')
      .isString().withMessage('message must be a string')
      .trim()
      .isLength({ min: 1, max: 500 }).withMessage('message must be between 1 and 500 chars')
      .escape(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { message } = req.body as { message: string };
      const intent = detectIntent(message);
      info('chat_intent', { intent });

      // Handle specific business intents first
      if (intent === Intent.CLIENT_ADDRESS) {
        const name = extractClientName(message) || 'abbas';
        const reply = await resolveClientAddress(name);
        return res.json({ reply });
      }
      if (intent === Intent.PROJECT_TODAY) {
        const reply = await resolveProjectToday();
        return res.json({ reply });
      }
      if (intent === Intent.LEADS_THIS_WEEK) {
        const reply = await resolveLeadsThisWeek();
        return res.json({ reply });
      }
      if (intent === Intent.LEAD_STATUS) {
        const reply = await resolveLeadStatus(message);
        return res.json({ reply });
      }

      // Check if this is a CRM data query or general question
      const userId = (req as any).user.id;
      console.log('[chat] Processing message for user:', userId);
      
      // Check if this is a CRM-related query
      const isCRMQuery = message.toLowerCase().includes('client') || 
                        message.toLowerCase().includes('project') || 
                        message.toLowerCase().includes('meeting') || 
                        message.toLowerCase().includes('lead') || 
                        message.toLowerCase().includes('crm') ||
                        message.toLowerCase().includes('how many') ||
                        message.toLowerCase().includes('count') ||
                        message.toLowerCase().includes('list') ||
                        message.toLowerCase().includes('show') ||
                        message.toLowerCase().includes('status') ||
                        message.toLowerCase().includes('due') ||
                        message.toLowerCase().includes('today') ||
                        message.toLowerCase().includes('pending') ||
                        message.toLowerCase().includes('lost') ||
                        message.toLowerCase().includes('started') ||
                        message.toLowerCase().includes('progress') ||
                        message.toLowerCase().includes('completed');
      
      // If it's a CRM query, try to get real data first
      if (isCRMQuery) {
        console.log('[chat] CRM query detected, trying to get data...');
        const crmData = await getCRMData(message, userId);
        if (crmData) {
          console.log('[chat] Found CRM data:', crmData);
          return res.json({ reply: crmData });
        }
      }

      // For general questions or if no CRM data found, use OpenRouter AI
      const apiKey = process.env.OPENROUTER_API_KEY || config.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return res.json({ reply: 'AI is not configured. Please set OPENROUTER_API_KEY on the server.' });
      }

      try {
        console.log('[chat] Using OpenRouter DeepSeek for query:', message);
        console.log('[chat] API key (first 10 chars):', apiKey.substring(0, 10) + '...');
        
        // Try with correct model format - remove the ":free" suffix
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'deepseek/deepseek-chat-v3-0324',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant. You can answer general questions and also help with CRM system queries. For CRM-related questions, you can help with specific queries about the user\'s own clients, projects, meetings, and leads. For general questions, provide helpful and accurate information. Keep responses concise and professional. Be conversational and helpful.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'CRM Assistant'
            },
            timeout: 15000 // Reduced timeout to prevent hanging
          }
        );

        console.log('[chat] OpenRouter success! Response:', response.data);

        if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          const reply = response.data.choices[0].message.content.trim();
          
          // If response is too short, provide a helpful addition
          if (reply.length < 20) {
            return res.json({ 
              reply: reply + '\n\nI can help you with general questions or specific CRM data queries. What would you like to know?' 
            });
          }
          
          return res.json({ reply });
        } else {
          throw new Error('Invalid response format from OpenRouter');
        }

      } catch (error: any) {
        console.error('[chat] OpenRouter error:', error?.response?.status, error?.message);
        
        // Try alternative model if first one fails
        try {
          console.log('[chat] Trying alternative model: deepseek/deepseek-chat-v2...');
          
          const altResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'deepseek/deepseek-chat-v2',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful business assistant for a CRM system. IMPORTANT: You can ONLY access and show data that belongs to the currently logged-in user. Never show data from other accounts or users. Keep responses concise and professional.'
                },
                {
                  role: 'user',
                  content: message
                }
              ],
              max_tokens: 150,
              temperature: 0.7
            },
          {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'CRM Assistant'
              },
              timeout: 15000
            }
          );

          console.log('[chat] Alternative model success! Response:', altResponse.data);

          if (altResponse.data.choices && altResponse.data.choices[0] && altResponse.data.choices[0].message) {
            const reply = altResponse.data.choices[0].message.content.trim();
            return res.json({ reply });
          }
        } catch (altError: any) {
          console.warn('[chat] Alternative model also failed:', altError?.response?.status, altError?.message);
        }
        
        // Provide helpful fallback responses based on the message content
        const lowerMessage = message.toLowerCase();
        let reply = '';

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
          reply = 'Hello! I\'m your CRM assistant. I can help you with information about YOUR clients, projects, meetings, and leads. What would you like to know?';
        } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
          reply = 'I can help you with:\n• YOUR client information and status (pending, lost, canceled, to be pitched, closed/won)\n• YOUR detailed client information (name, phone, email, business, address, description)\n• YOUR project details and status (started, in progress, on hold, completed)\n• YOUR meeting schedules and details\n• YOUR lead information and status\n• General business queries\n\nJust ask me about any of these topics! I only show data from your account.';
        } else if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
          reply = 'I can help you find YOUR client information. Try asking:\n• "How many clients do I have?"\n• "Show me my clients"\n• "Show client details" or "Client information"\n• "How many pending clients?"\n• "How many lost clients?"\n• "How many canceled clients?"\n• "How many to be pitched clients?"\n• "What\'s my client status breakdown?"\n• "List my pending clients"\n• "Show my lost clients"\n• "List canceled clients"\n• "Show to be pitched clients"';
        } else if (lowerMessage.includes('project')) {
          reply = 'I can help you with YOUR project information. Try asking:\n• "How many projects do I have?"\n• "Show me my projects"\n• "How many started projects?"\n• "How many in progress projects?"\n• "How many on hold projects?"\n• "How many completed projects?"\n• "What\'s my project status breakdown?"\n• "List my started projects"\n• "Show in progress projects"\n• "List on hold projects"\n• "Show completed projects"';
        } else if (lowerMessage.includes('meeting')) {
          reply = 'I can help you with YOUR meeting information. Try asking "How many meetings do I have?" or "What meetings are scheduled today?"';
        } else if (lowerMessage.includes('lead')) {
          reply = 'I can help you with YOUR lead information. Try asking "How many leads do I have?" or "What is the status of my leads?"';
        } else {
          reply = `I understand you're asking about "${message}". I'm here to help with YOUR CRM data only. You can ask me about your clients, projects, meetings, leads, or general business questions. What specific information do you need?`;
        }

        return res.json({ reply });
      }

    } catch (err) {
      console.error('[chat_error]', err);
      return res.json({ reply: 'I\'m having trouble processing your request right now. Please try again in a moment or ask me about your clients, projects, meetings, or leads.' });
    }
  }
);

export default router;
