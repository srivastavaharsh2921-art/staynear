import { Router } from 'express';
import * as controller from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireRole('ADMIN'));
adminRoutes.get('/properties/pending', asyncHandler(controller.pending));
adminRoutes.patch('/properties/:id/verify', asyncHandler(controller.verify));
adminRoutes.patch('/properties/:id/reject', asyncHandler(controller.reject));