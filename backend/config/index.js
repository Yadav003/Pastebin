require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : (process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false),
  },
  testMode: process.env.TEST_MODE === '1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};

module.exports = config;
