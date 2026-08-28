import { Schema, model, type InferSchemaType } from 'mongoose';

export const USER_ROLES = ['STUDENT', 'OWNER', 'ADMIN'] as const;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: USER_ROLES, default: 'STUDENT', index: true },
  profile: { phone: { type: String, trim: true }, avatar: String },
  preferences: {
    college: { type: String, default: 'Dev Bhoomi Uttarakhand University' },
    stayType: { type: [String], default: [] },
    budget: { type: String, default: '' },
    amenities: { type: [String], default: [] }
  }
}, { timestamps: true });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);