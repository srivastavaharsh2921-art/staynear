import type { Request, Response } from 'express';
import * as service from '../services/user.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function profile(request: Request, response: Response) { sendSuccess(response, 200, { user: await service.getProfile(request.user!.id) }); }
export async function updateProfile(request: Request, response: Response) { sendSuccess(response, 200, { user: await service.updateProfile(request.user!.id, request.body) }); }
export async function preferences(request: Request, response: Response) { sendSuccess(response, 200, { user: await service.updatePreferences(request.user!.id, request.body) }); }