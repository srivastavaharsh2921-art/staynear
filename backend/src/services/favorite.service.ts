import { FavoriteModel } from '../models/favorite.model.js';
import { PropertyModel } from '../models/property.model.js';

export async function listFavorites(userId: string) { return FavoriteModel.find({ userId }).populate('propertyId').sort({ createdAt: -1 }).lean(); }
export async function addFavorite(userId: string, propertyId: string) {
  const property = await PropertyModel.findOne({ _id: propertyId, status: 'PUBLISHED', 'verification.status': 'VERIFIED' });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404, code: 'NOT_FOUND' });
  return FavoriteModel.create({ userId, propertyId });
}
export async function removeFavorite(userId: string, propertyId: string) { return FavoriteModel.findOneAndDelete({ userId, propertyId }); }