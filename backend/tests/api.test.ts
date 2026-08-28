import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

const runMongoTests = process.env.RUN_MONGO_TESTS === 'true';
let mongo: MongoMemoryServer | undefined;
let databaseAvailable = false;
let app: typeof import('../src/app.js').app;
let UserModel: typeof import('../src/models/user.model.js').UserModel;
let PropertyModel: typeof import('../src/models/property.model.js').PropertyModel;

beforeAll(async () => {
  if (!runMongoTests) return;
  try {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    ({ app } = await import('../src/app.js'));
    ({ UserModel } = await import('../src/models/user.model.js'));
    ({ PropertyModel } = await import('../src/models/property.model.js'));
    const { connectDatabase } = await import('../src/config/database.js');
    await connectDatabase();
    databaseAvailable = true;
  } catch (error) {
    console.warn(`Mongo integration tests skipped: ${error instanceof Error ? error.message : error}`);
  }
});

afterAll(async () => {
  const { disconnectDatabase } = await import('../src/config/database.js');
  if (databaseAvailable) await disconnectDatabase();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  if (!databaseAvailable) return;
  await UserModel.deleteMany({});
  await PropertyModel.deleteMany({});
});

describe.skipIf(!runMongoTests)('authentication', () => {
  it('signs up, logs in, and protects the current-user route', async () => {
    if (!databaseAvailable) return;
    const signup = await request(app).post('/api/auth/signup').send({ name: 'Test Student', email: 'student@example.com', password: 'secret123' });
    expect(signup.status).toBe(201);
    expect(signup.body.success).toBe(true);
    expect(signup.body.data.user).not.toHaveProperty('passwordHash');
    const login = await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'secret123' });
    expect(login.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('student@example.com');
  });

  it('rejects duplicate emails and invalid passwords', async () => {
    if (!databaseAvailable) return;
    await request(app).post('/api/auth/signup').send({ name: 'Test Student', email: 'student@example.com', password: 'secret123' });
    expect((await request(app).post('/api/auth/signup').send({ name: 'Other', email: 'student@example.com', password: 'secret123' })).status).toBe(409);
    expect((await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'wrong' })).status).toBe(401);
  });
});

describe.skipIf(!runMongoTests)('properties and favorites', () => {
  it('filters verified properties and prevents duplicate favorites', async () => {
    if (!databaseAvailable) return;
    const user = await UserModel.create({ name: 'Student', email: 'student@example.com', passwordHash: 'not-used' });
    const property = await PropertyModel.create({ owner: user._id, name: 'Verified PG', type: 'PG', description: 'A verified student stay near DBUU.', location: { address: 'Naugaon', area: 'Naugaon', city: 'Dehradun', state: 'Uttarakhand' }, pricing: { monthlyRent: 6500, securityDeposit: 6500 }, rooms: { occupancy: 'Double Sharing', totalRooms: 2, availableRooms: 1 }, amenities: ['WiFi'], verification: { status: 'VERIFIED' }, status: 'PUBLISHED' });
    const signup = await request(app).post('/api/auth/signup').send({ name: 'Another Student', email: 'another@example.com', password: 'secret123' });
    const token = signup.body.data.token;
    const list = await request(app).get('/api/properties').query({ type: 'PG', minRent: 6000, maxRent: 7000, amenities: 'WiFi', page: 1, limit: 20 });
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.pagination.total).toBe(1);
    const favorite = await request(app).post(`/api/favorites/${property.id}`).set('Authorization', `Bearer ${token}`);
    expect(favorite.status).toBe(201);
    expect((await request(app).post(`/api/favorites/${property.id}`).set('Authorization', `Bearer ${token}`)).status).toBe(409);
    expect((await request(app).delete(`/api/favorites/${property.id}`).set('Authorization', `Bearer ${token}`)).status).toBe(200);
  });
});