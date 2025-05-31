const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'development') {
  // Use SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
  });
  console.log('Using SQLite for development');
} else {
  // Use SQL Server for production
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_SERVER,
      port: process.env.DB_PORT,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: true,
          enableArithAbort: true,
          trustServerCertificate: true,
        },
      },
      logging: false
    }
  );
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};