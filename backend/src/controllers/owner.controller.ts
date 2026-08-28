import type { Request, Response } from 'express';
import * as propertyService from '../services/property.service.js';
import * as ownerService from '../services/owner.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

export async function list(request: Request, response: Response) { sendSuccess(response, 200, { items: await ownerService.listOwnedProperties(request.user!.id) }); }
export async function create(request: Request, response: Response) { sendSuccess(response, 201, { property: await propertyService.createProperty(request.user!.id, request.body) }); }
export async function update(request: Request, response: Response) { const property = await propertyService.updateOwnedProperty(String(request.params.id), request.user!.id, request.body); return property ? sendSuccess(response, 200, { property }) : sendError(response, 404, 'NOT_FOUND', 'Property not found'); }
export async function remove(request: Request, response: Response) { const property = await propertyService.deleteOwnedProperty(String(request.params.id), request.user!.id); return property ? sendSuccess(response, 200, { property }) : sendError(response, 404, 'NOT_FOUND', 'Property not found'); }