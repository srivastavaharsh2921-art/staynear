import { PropertyModel } from '../models/property.model.js';

export async function listOwnedProperties(ownerId: string) { return PropertyModel.find({ owner: ownerId }).sort({ createdAt: -1 }).lean(); }
export async function findOwnedProperty(id: string, ownerId: string) { return PropertyModel.findOne({ _id: id, owner: ownerId }); }