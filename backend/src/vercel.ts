import type { Request, Response } from 'express';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

let isConnected = false;

export default async function handler(req: Request, res: Response) {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (error) {
      console.error('Vercel DB Connection Error:', error);
    }
  }

  return app(req, res);
}