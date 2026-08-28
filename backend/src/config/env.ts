import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/staynear'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-please'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5000'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/auth/google/callback')
}).refine(data => !(data.NODE_ENV === 'production' && data.JWT_SECRET === 'development-only-secret-change-me-please'), { message: 'JWT_SECRET must be explicitly set in production' });

export const env = envSchema.parse(process.env);