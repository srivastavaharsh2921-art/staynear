import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const notFound = (request: Request, response: Response): void => sendError(response, 404, 'NOT_FOUND', `Route ${request.method} ${request.path} not found`);

export const errorHandler: ErrorRequestHandler = (error: unknown, request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) return sendError(response, 422, 'VALIDATION_ERROR', error.issues.map(issue => issue.message).join(', '));
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) return sendError(response, 409, 'DUPLICATE_ERROR', 'A record with these details already exists');
  if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
    return sendError(response, error.status, 'code' in error ? String(error.code) : 'ERROR', error.message);
  }
  logger.error({ error, method: request.method, path: request.path }, 'Unhandled request error');
  sendError(response, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
};