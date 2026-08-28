import { Router } from 'express';
import * as controller from '../controllers/favorite.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const favoriteRoutes = Router();
favoriteRoutes.use(requireAuth);
favoriteRoutes.get('/', asyncHandler(controller.list));
favoriteRoutes.post('/:propertyId', asyncHandler(controller.add));
favoriteRoutes.delete('/:propertyId', asyncHandler(controller.remove));