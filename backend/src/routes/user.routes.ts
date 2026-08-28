import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { profileSchema, preferencesSchema } from '../validators/user.validator.js';
import { asyncHandler } from '../utils/async-handler.js';

export const userRoutes = Router();
userRoutes.use(requireAuth);
userRoutes.get('/me', asyncHandler(controller.profile));
userRoutes.patch('/me', validate(profileSchema), asyncHandler(controller.updateProfile));
userRoutes.patch('/me/preferences', validate(preferencesSchema), asyncHandler(controller.preferences));