import { Types } from 'mongoose';
import { PropertyModel } from '../models/property.model.js';

export type PropertyFilters = { search?: string; type?: string; minRent?: number; maxRent?: number; amenities?: string[]; city?: string; occupancy?: string; available?: boolean; page: number; limit: number; includeUnverified?: boolean };

export async function listProperties(filters: PropertyFilters) {
  const query: Record<string, unknown> = { status: 'PUBLISHED' };
  if (!filters.includeUnverified) query['verification.status'] = 'VERIFIED';
  if (filters.type && filters.type !== 'All') query.type = filters.type;
  if (filters.city) query['location.city'] = new RegExp(filters.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (filters.occupancy) query['rooms.occupancy'] = new RegExp(filters.occupancy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (filters.minRent !== undefined || filters.maxRent !== undefined) query['pricing.monthlyRent'] = { ...(filters.minRent !== undefined ? { $gte: filters.minRent } : {}), ...(filters.maxRent !== undefined ? { $lte: filters.maxRent } : {}) };
  if (filters.amenities?.length) query.amenities = { $all: filters.amenities };
  if (filters.search) query.$text = { $search: filters.search };
  if (filters.available) query['rooms.availableRooms'] = { $gt: 0 };
  const skip = (filters.page - 1) * filters.limit;
  const [items, total] = await Promise.all([PropertyModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit).lean(), PropertyModel.countDocuments(query)]);
  return { items, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } };
}

export async function getProperty(id: string, includeUnverified = false) {
  const query: Record<string, unknown> = { _id: id };
  if (!includeUnverified) query['verification.status'] = 'VERIFIED';
  return PropertyModel.findOne(query).lean();
}

export async function createProperty(ownerId: string, values: Record<string, unknown>) { return PropertyModel.create({ ...values, owner: ownerId, status: 'PUBLISHED', verification: { status: 'PENDING' } }); }
export async function updateOwnedProperty(id: string, ownerId: string, values: Record<string, unknown>) { return PropertyModel.findOneAndUpdate({ _id: id, owner: ownerId }, { $set: values, $setOnInsert: {} }, { new: true, runValidators: true }); }
export async function deleteOwnedProperty(id: string, ownerId: string) { return PropertyModel.findOneAndUpdate({ _id: id, owner: ownerId }, { $set: { status: 'ARCHIVED' } }, { new: true }); }