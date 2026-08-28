import { AdminActionModel } from '../models/admin-action.model.js';
import { PropertyModel } from '../models/property.model.js';

export async function pendingProperties() { return PropertyModel.find({ 'verification.status': { $in: ['PENDING', 'UNDER_REVIEW'] } }).populate('owner', 'name email').sort({ createdAt: 1 }).lean(); }
export async function verifyProperty(propertyId: string, adminId: string) {
  const property = await PropertyModel.findByIdAndUpdate(propertyId, { $set: { 'verification.status': 'VERIFIED', 'verification.verifiedAt': new Date(), 'verification.verifiedBy': adminId, status: 'PUBLISHED' } }, { new: true });
  if (property) await AdminActionModel.create({ adminId, propertyId, action: 'VERIFY' });
  return property;
}
export async function rejectProperty(propertyId: string, adminId: string, note?: string) {
  const property = await PropertyModel.findByIdAndUpdate(propertyId, { $set: { 'verification.status': 'REJECTED', 'verification.rejectionReason': note, status: 'ARCHIVED' } }, { new: true });
  if (property) await AdminActionModel.create({ adminId, propertyId, action: 'REJECT', note });
  return property;
}