import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/api-response.js';

declare global {
  namespace Express { interface Request { user?: { id: string; role: string }; } }
}

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return sendError(response, 401, 'UNAUTHORIZED', 'Authentication required');
    const token = verifyToken(header.slice(7));
    const user = await UserModel.findById(token.userId).select('_id role');
    if (!user) return sendError(response, 401, 'UNAUTHORIZED', 'Authentication required');
    request.user = { id: user.id, role: user.role };
    next();
  } catch { sendError(response, 401, 'UNAUTHORIZED', 'Invalid or expired token'); }
}