import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { PropertyModel } from './models/property.model.js';
import { UserModel } from './models/user.model.js';
import { hashPassword } from './utils/password.js';

type LegacyProperty = { name: string; type: string; price: number; description: string; location: string; image: string; thumbnails: string[]; facilities: string[]; occupancy: string; availableRooms: number; deposit: number; ownerPhone: string };

async function seed(): Promise<void> {
  const raw = await fs.readFile(path.resolve(process.cwd(), 'data.json'), 'utf8');
  const data = JSON.parse(raw) as { properties: LegacyProperty[] };
  await connectDatabase();
  let owner = await UserModel.findOne({ email: 'seed-owner@staynear.local' });
  if (!owner) owner = await UserModel.create({ name: 'StayNear Verified Owner', email: 'seed-owner@staynear.local', passwordHash: await hashPassword('change-this-seed-password'), role: 'OWNER', profile: { phone: '+919876543210' } });
  await PropertyModel.deleteMany({ owner: owner._id });
  await PropertyModel.insertMany(data.properties.map(property => ({ owner: owner._id, name: property.name, type: property.type, description: property.description, location: { address: property.location, area: property.location.split(',')[0], city: 'Dehradun', state: 'Uttarakhand', landmark: 'DBUU' }, pricing: { monthlyRent: property.price, securityDeposit: property.deposit }, rooms: { occupancy: property.occupancy, totalRooms: property.availableRooms, availableRooms: property.availableRooms }, amenities: property.facilities, images: [property.image, ...property.thumbnails], verification: { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: owner._id }, status: 'PUBLISHED' })));
  await disconnectDatabase();
  console.log(`Seeded ${data.properties.length} properties`);
}

seed().catch(error => { console.error(error); process.exitCode = 1; });