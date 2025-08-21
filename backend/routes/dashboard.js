const express = require('express');
const Client = require('../models/Client');
const Meeting = require('../models/Meeting');
const router = express.Router();

// GET dashboard overview statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get client statistics
    const clientStats = await Client.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$pitch_status', count: { $sum: 1 } } }
          ],
          monthlyGrowth: [
            {
              $match: {
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    // Get meeting statistics
    const meetingStats = await Meeting.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
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
    
    // Calculate conversion rates
    const totalClients = await Client.countDocuments({ user: req.user._id });
    const wonClients = await Client.countDocuments({ user: req.user._id, pitch_status: 'Closed/Won' });
    const conversionRate = totalClients > 0 ? (wonClients / totalClients * 100).toFixed(1) : 0;
    
    // Build response
    const statusBreakdown = {};
    clientStats[0].statusBreakdown.forEach(stat => {
      statusBreakdown[stat._id] = stat.count;
    });
    
    res.json({
      total_clients: totalClients,
      status_breakdown: statusBreakdown,
      upcoming_meetings: meetingStats[0].upcomingMeetings[0]?.count || 0,
      conversion_rate: parseFloat(conversionRate)
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
