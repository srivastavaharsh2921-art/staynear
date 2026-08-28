import type { Request, Response } from 'express';
import * as service from '../services/admin.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

export async function pending(_request: Request, response: Response) { sendSuccess(response, 200, { items: await service.pendingProperties() }); }
export async function verify(request: Request, response: Response) { const property = await service.verifyProperty(String(request.params.id), request.user!.id); return property ? sendSuccess(response, 200, { property }) : sendError(response, 404, 'NOT_FOUND', 'Property not found'); }
export async function reject(request: Request, response: Response) { const property = await service.rejectProperty(String(request.params.id), request.user!.id, request.body.note); return property ? sendSuccess(response, 200, { property }) : sendError(response, 404, 'NOT_FOUND', 'Property not found'); }