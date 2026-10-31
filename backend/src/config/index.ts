import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  maxRequestLogs: parseInt(process.env.MAX_REQUEST_LOGS || '1000', 10),
  defaultAuthToken: process.env.DEFAULT_AUTH_TOKEN || 'sentinel-mock-jwt-token-xyz',
  defaultApiKey: process.env.DEFAULT_API_KEY || 'sentinel-api-key-live-12345',
  defaultBasicAuth: {
    username: process.env.BASIC_AUTH_USER || 'admin',
    password: process.env.BASIC_AUTH_PASSWORD || 'sentinel123',
  },
};
