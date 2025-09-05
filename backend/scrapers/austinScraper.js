const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { pool } = require('../config/database');

class AustinScraper {
  constructor() {
    this.baseUrl = 'https://data.austintexas.gov/api/views/3syk-w9eu/rows.csv';
    this.city = 'Austin, TX';
  }

  async scrapePermits() {
    try {
      console.log(`🔍 Starting scrape for ${this.city}...`);
      
      const response = await axios.get(this.baseUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const permits = [];
      const stream = Readable.from(response.data);
      
      return new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row) => {
            // Map Austin data fields to our schema
            const permit = {
              permit_id: row['Permit Number'] || row['permit_number'],
              city: this.city,
              permit_type: row['Permit Type'] || row['permit_type'],
              work_class: row['Work Class'] || row['work_class'],
              issued_date: this.parseDate(row['Issued Date'] || row['issued_date']),
              applied_date: this.parseDate(row['Applied Date'] || row['applied_date']),
              zip_code: row['Zip Code'] || row['zip_code'],
              district: row['Council District'] || row['district'],
              sqft: row['Sq Ft'] || row['sqft'],
              location: row['Location'] || row['location'],
              contractor: row['Contractor Name'] || row['contractor'],
              validation_amount: row['Valuation'] || row['validation']
            };
            
            if (permit.permit_id) {
              permits.push(permit);
            }
          })
          .on('end', async () => {
            console.log(`📊 Scraped ${permits.length} permits from ${this.city}`);
            await this.savePermits(permits);
            resolve(permits);
          })
          .on('error', (error) => {
            console.error(`❌ Error scraping ${this.city}:`, error);
            reject(error);
          });
      });
    } catch (error) {
      console.error(`❌ Failed to scrape ${this.city}:`, error.message);
      throw error;
    }
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle various date formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  async savePermits(permits) {
    if (permits.length === 0) return;

    try {
      const connection = await pool.getConnection();
      
      for (const permit of permits) {
        // Check if permit already exists
        const [existing] = await connection.execute(
          'SELECT id FROM permits WHERE permit_id = ? AND city = ?',
          [permit.permit_id, permit.city]
        );

        if (existing.length === 0) {
          // Insert new permit
          await connection.execute(
            `INSERT INTO permits (
              permit_id, city, permit_type, work_class, issued_date, 
              applied_date, zip_code, district, sqft, location, 
              contractor, validation_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              permit.permit_id, permit.city, permit.permit_type, permit.work_class,
              permit.issued_date, permit.applied_date, permit.zip_code, permit.district,
              permit.sqft, permit.location, permit.contractor, permit.validation_amount
            ]
          );
        }
      }

      connection.release();
      console.log(`✅ Saved ${permits.length} permits to database`);
    } catch (error) {
      console.error('❌ Error saving permits:', error);
      throw error;
    }
  }

  async getLatestPermits(limit = 100) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM permits WHERE city = ? ORDER BY scraped_at DESC LIMIT ?',
        [this.city, limit]
      );
      connection.release();
      return rows;
    } catch (error) {
      console.error('❌ Error fetching permits:', error);
      throw error;
    }
  }
}

module.exports = AustinScraper;
