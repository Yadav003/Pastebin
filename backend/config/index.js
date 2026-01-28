require('dotenv').config();

// Auto-detect Vercel deployment URL
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const isProduction = process.env.NODE_ENV === 'production';

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
    ssl: isProduction ? { rejectUnauthorized: false } : (process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false),
  },
  testMode: process.env.TEST_MODE === '1',
  // Dynamic URLs: prioritize env vars, fallback to Vercel auto-detection, then localhost
  frontendUrl: process.env.FRONTEND_URL || vercelUrl || 'http://localhost:5173',
  baseUrl: process.env.BASE_URL || vercelUrl || 'http://localhost:3000',
};

module.exports = config;
