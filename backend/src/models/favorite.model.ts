import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export const FavoriteModel = model('Favorite', favoriteSchema);