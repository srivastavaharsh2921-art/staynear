import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { authRateLimit } from '../middleware/rate-limit.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authRoutes = Router();
authRoutes.post('/signup', authRateLimit, validate(signupSchema), asyncHandler(controller.signup));
authRoutes.post('/login', authRateLimit, validate(loginSchema), asyncHandler(controller.login));
authRoutes.post('/logout', requireAuth, asyncHandler(controller.logout));
authRoutes.get('/me', requireAuth, asyncHandler(controller.me));
authRoutes.get('/google', asyncHandler(controller.googleAuth));
authRoutes.get('/google/callback', asyncHandler(controller.googleCallback));