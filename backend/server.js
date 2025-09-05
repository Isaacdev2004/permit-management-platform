const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const { testConnection, pool } = require('./config/database');
const AustinScraper = require('./scrapers/austinScraper');
const emailService = require('./services/emailService');

// Import routes
const permitsRouter = require('./routes/permits');
const clientsRouter = require('./routes/clients');
const emailRouter = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/permits', permitsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/email', emailRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Permit Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Scheduled scraping (daily at 6 AM)
cron.schedule('0 6 * * *', async () => {
  console.log('🕕 Running scheduled permit scraping...');
  try {
    const scraper = new AustinScraper();
    await scraper.scrapePermits();
    console.log('✅ Scheduled scraping completed');
  } catch (error) {
    console.error('❌ Scheduled scraping failed:', error);
  }
});

// Scheduled email reports (daily at 7 AM)
cron.schedule('0 7 * * *', async () => {
  console.log('📧 Running scheduled email reports...');
  try {
    // Get all active email subscriptions
    const [subscriptions] = await pool.query('SELECT * FROM email_subscriptions WHERE isActive = true');
    
    if (subscriptions.length === 0) {
      console.log('📧 No active email subscriptions found');
      return;
    }

    // Get recent permits (last 24 hours)
    const [permits] = await pool.query('SELECT * FROM permits WHERE scraped_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)');
    
    if (permits.length === 0) {
      console.log('📧 No new permits found for email reports');
      return;
    }

    // Group subscriptions by their criteria
    const subscriptionGroups = {};
    subscriptions.forEach(sub => {
      const key = `${sub.city}-${sub.workClass}`;
      if (!subscriptionGroups[key]) {
        subscriptionGroups[key] = {
          subscriptions: [],
          filters: { city: sub.city, workClass: sub.workClass }
        };
      }
      subscriptionGroups[key].subscriptions.push(sub);
    });

    // Send emails to each group
    let totalSent = 0;
    for (const [key, group] of Object.entries(subscriptionGroups)) {
      const groupPermits = permits.filter(permit => {
        const cityMatch = group.filters.city === 'All Cities' || permit.city === group.filters.city;
        const workClassMatch = group.filters.workClass === 'All Types' || permit.work_class === group.filters.workClass;
        return cityMatch && workClassMatch;
      });

      if (groupPermits.length > 0) {
        const recipients = group.subscriptions.map(sub => sub.email);
        
        try {
          await emailService.sendPermitReport(recipients, groupPermits, group.filters);
          totalSent += recipients.length;
          
          // Update last_sent timestamp
          for (const sub of group.subscriptions) {
            await pool.query('UPDATE email_subscriptions SET last_sent = ? WHERE id = ?', 
              [new Date().toISOString(), sub.id]);
          }
          
          console.log(`📧 Sent ${groupPermits.length} permits to ${recipients.length} subscribers (${key})`);
        } catch (error) {
          console.error(`❌ Failed to send email to group ${key}:`, error.message);
        }
      }
    }

    console.log(`✅ Scheduled email reports completed - ${totalSent} emails sent`);
  } catch (error) {
    console.error('❌ Scheduled email reports failed:', error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
