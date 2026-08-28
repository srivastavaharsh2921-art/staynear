import cors from 'cors';
import { env } from './env.js';

export const corsMiddleware = cors({
  origin: env.NODE_ENV === 'development' ? true : env.FRONTEND_URL,
  credentials: true
});