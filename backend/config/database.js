// Use memory database for development (no MySQL setup required)
const { pool, testConnection } = require('./memoryDb');

module.exports = { pool, testConnection };
