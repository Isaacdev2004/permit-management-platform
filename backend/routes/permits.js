const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const AustinScraper = require('../scrapers/austinScraper');

// Get all permits with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      workClass, 
      contractor, 
      search, 
      limit = 100, 
      offset = 0 
    } = req.query;

    let query = 'SELECT * FROM permits WHERE 1=1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (workClass) {
      query += ' AND work_class = ?';
      params.push(workClass);
    }

    if (contractor) {
      query += ' AND contractor LIKE ?';
      params.push(`%${contractor}%`);
    }

    if (search) {
      query += ' AND (location LIKE ? OR contractor LIKE ? OR permit_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY scraped_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    connection.release();

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching permits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permits'
    });
  }
});

// Get permit statistics
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [totalPermits] = await connection.execute('SELECT COUNT(*) as total FROM permits');
    const [cities] = await connection.execute('SELECT city, COUNT(*) as count FROM permits GROUP BY city');
    const [workClasses] = await connection.execute('SELECT work_class, COUNT(*) as count FROM permits GROUP BY work_class ORDER BY count DESC LIMIT 10');
    
    connection.release();

    res.json({
      success: true,
      data: {
        totalPermits: totalPermits[0].total,
        cities,
        topWorkClasses: workClasses
      }
    });
  } catch (error) {
    console.error('Error fetching permit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permit statistics'
    });
  }
});

// Trigger manual scrape
router.post('/scrape', async (req, res) => {
  try {
    const { city } = req.body;
    
    if (city === 'Austin, TX' || !city) {
      const scraper = new AustinScraper();
      const permits = await scraper.scrapePermits();
      
      res.json({
        success: true,
        message: `Scraped ${permits.length} permits from Austin, TX`,
        data: permits.slice(0, 10) // Return first 10 for preview
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'City not supported yet'
      });
    }
  } catch (error) {
    console.error('Error scraping permits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scrape permits'
    });
  }
});

// Export permits as CSV
router.get('/export', async (req, res) => {
  try {
    const { city, workClass, contractor, search } = req.query;

    let query = 'SELECT * FROM permits WHERE 1=1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (workClass) {
      query += ' AND work_class = ?';
      params.push(workClass);
    }

    if (contractor) {
      query += ' AND contractor LIKE ?';
      params.push(`%${contractor}%`);
    }

    if (search) {
      query += ' AND (location LIKE ? OR contractor LIKE ? OR permit_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY scraped_at DESC';

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    connection.release();

    // Convert to CSV
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No permits found for export'
      });
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="permits_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting permits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export permits'
    });
  }
});

module.exports = router;
