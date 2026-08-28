import { z } from 'zod';

export const preferencesSchema = z.object({ college: z.string().trim().max(150).optional(), stayType: z.array(z.string().max(50)).max(10).optional(), budget: z.string().max(30).optional(), amenities: z.array(z.string().max(50)).max(20).optional() }).strict();
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), phone: z.string().trim().max(30).optional() }).strict();