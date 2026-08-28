import { Schema, model, type InferSchemaType } from 'mongoose';

export const PROPERTY_TYPES = ['PG', 'Private Room', 'Shared Room', 'Hostel'] as const;
export const PROPERTY_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const VERIFICATION_STATUSES = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const;

const propertySchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: PROPERTY_TYPES, required: true, index: true },
  description: { type: String, required: true, maxlength: 2000 },
  location: {
    address: { type: String, required: true }, area: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true }, state: { type: String, required: true },
    landmark: String, latitude: Number, longitude: Number
  },
  pricing: { monthlyRent: { type: Number, required: true, min: 100, index: true }, securityDeposit: { type: Number, required: true, min: 0 } },
  rooms: { occupancy: { type: String, required: true }, totalRooms: { type: Number, required: true, min: 1 }, availableRooms: { type: Number, required: true, min: 0 } },
  amenities: { type: [String], default: [] }, images: { type: [String], default: [] },
  rating: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0, min: 0 } },
  verification: { status: { type: String, enum: VERIFICATION_STATUSES, default: 'PENDING', index: true }, verifiedAt: Date, verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }, rejectionReason: String },
  status: { type: String, enum: PROPERTY_STATUSES, default: 'DRAFT', index: true }
}, { timestamps: true });

propertySchema.index({ 'location.city': 1, 'pricing.monthlyRent': 1, type: 1 });
propertySchema.index({ name: 'text', description: 'text', 'location.address': 'text', 'location.area': 'text' });

export type Property = InferSchemaType<typeof propertySchema>;
export const PropertyModel = model('Property', propertySchema);