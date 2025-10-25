// backend/src/config/db.js
const path = require('path');
const { Sequelize } = require('sequelize');

// Use env var DB_FILE if provided (production with persistent disk).
// Otherwise use a local file in the project for development.
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', '..', 'contacts.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbFile,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully. DB file:', dbFile);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };

