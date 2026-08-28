import { Router } from 'express';
import * as controller from '../controllers/property.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { propertySchema, propertyUpdateSchema } from '../validators/property.validator.js';
import { asyncHandler } from '../utils/async-handler.js';

export const propertyRoutes = Router();
propertyRoutes.get('/', asyncHandler(controller.list));
propertyRoutes.get('/:id', asyncHandler(controller.getById));
propertyRoutes.post('/', requireAuth, requireRole('OWNER', 'ADMIN'), validate(propertySchema), asyncHandler(controller.create));
propertyRoutes.patch('/:id', requireAuth, requireRole('OWNER', 'ADMIN'), validate(propertyUpdateSchema), asyncHandler(controller.update));
propertyRoutes.delete('/:id', requireAuth, requireRole('OWNER', 'ADMIN'), asyncHandler(controller.remove));