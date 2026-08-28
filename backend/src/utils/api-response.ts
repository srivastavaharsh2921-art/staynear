import type { Response } from 'express';

export function sendSuccess<T>(response: Response, status: number, data: T): void {
  response.status(status).json({ success: true, data });
}

export function sendError(response: Response, status: number, code: string, message: string): void {
  response.status(status).json({ success: false, error: { code, message } });
}