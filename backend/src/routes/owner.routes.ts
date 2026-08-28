import { Router } from 'express';
import * as controller from '../controllers/owner.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { propertySchema, propertyUpdateSchema } from '../validators/property.validator.js';
import { asyncHandler } from '../utils/async-handler.js';

export const ownerRoutes = Router();
ownerRoutes.use(requireAuth, requireRole('OWNER'));
ownerRoutes.get('/properties', asyncHandler(controller.list));
ownerRoutes.post('/properties', validate(propertySchema), asyncHandler(controller.create));
ownerRoutes.patch('/properties/:id', validate(propertyUpdateSchema), asyncHandler(controller.update));
ownerRoutes.delete('/properties/:id', asyncHandler(controller.remove));