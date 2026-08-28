import { UserModel } from '../models/user.model.js';

export async function getProfile(userId: string) {
  return UserModel.findById(userId).select('-passwordHash');
}

export async function updateProfile(userId: string, values: { name?: string; phone?: string }) {
  const update: Record<string, string> = {};
  if (values.name) update.name = values.name;
  if (values.phone !== undefined) update['profile.phone'] = values.phone;
  return UserModel.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true }).select('-passwordHash');
}

export async function updatePreferences(userId: string, preferences: Record<string, unknown>) {
  const update = Object.fromEntries(Object.entries(preferences).map(([key, value]) => [`preferences.${key}`, value]));
  return UserModel.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true }).select('-passwordHash');
}