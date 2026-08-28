import type { Request, Response } from 'express';
import * as service from '../services/favorite.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function list(request: Request, response: Response) { sendSuccess(response, 200, { items: await service.listFavorites(request.user!.id) }); }
export async function add(request: Request, response: Response) { sendSuccess(response, 201, { favorite: await service.addFavorite(request.user!.id, String(request.params.propertyId)) }); }
export async function remove(request: Request, response: Response) { sendSuccess(response, 200, { removed: Boolean(await service.removeFavorite(request.user!.id, String(request.params.propertyId))) }); }