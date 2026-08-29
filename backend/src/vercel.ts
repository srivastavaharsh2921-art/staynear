import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { Request, Response } from 'express';

let isConnected = false;

export default async function handler(req: Request, res: Response) {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (e) {
      console.error('Vercel DB Connection Error:', e);
    }
  }
  return app(req, res);
}

