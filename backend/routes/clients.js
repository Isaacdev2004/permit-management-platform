const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM clients ORDER BY created_at DESC');
    connection.release();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const { company, email, industry } = req.body;

    if (!company || !email) {
      return res.status(400).json({
        success: false,
        error: 'Company and email are required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO clients (company, email, industry) VALUES (?, ?, ?)',
      [company, email, industry]
    );
    connection.release();

    res.json({
      success: true,
      data: { id: result.insertId, company, email, industry, automations: 0 }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create client'
      });
    }
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, email, industry } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE clients SET company = ?, email = ?, industry = ? WHERE id = ?',
      [company, email, industry, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM clients WHERE id = ?', [id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
});

module.exports = router;
