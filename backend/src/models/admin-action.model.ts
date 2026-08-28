import { Schema, model } from 'mongoose';

const adminActionSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  action: { type: String, enum: ['VERIFY', 'REJECT', 'REVIEW'], required: true },
  note: String
}, { timestamps: true });

export const AdminActionModel = model('AdminAction', adminActionSchema);