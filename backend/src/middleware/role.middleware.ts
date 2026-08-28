import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';

export function requireRole(...roles: string[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.user || !roles.includes(request.user.role)) return sendError(response, 403, 'FORBIDDEN', 'You do not have permission for this action');
    next();
  };
}