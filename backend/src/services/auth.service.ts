import { UserModel } from '../models/user.model.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

type UserView = { _id: unknown; name: string; email: string; role: string; profile?: unknown; preferences?: unknown };

function serializeUser(user: UserView) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, profile: user.profile, preferences: user.preferences };
}

export async function signup(name: string, email: string, password: string) {
  const user = await UserModel.create({ name, email, passwordHash: await hashPassword(password) });
  return { token: signToken({ userId: user.id, role: user.role }), user: serializeUser(user) };
}

export async function login(email: string, password: string) {
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user || !(await comparePassword(password, user.passwordHash))) throw Object.assign(new Error('Invalid email or password'), { status: 401, code: 'INVALID_CREDENTIALS' });
  return { token: signToken({ userId: user.id, role: user.role }), user: serializeUser(user) };
}

export async function getCurrentUser(userId: string) {
  return UserModel.findById(userId).select('-passwordHash');
}

const getGoogleClient = () => new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL);

export function getGoogleAuthUrl() {
  if (!env.GOOGLE_CLIENT_ID) {
    // FAKE OAUTH FLOW FOR PROTOTYPE (If keys are not set)
    return '/api/auth/google/callback?code=mock-google-auth-code';
  }
  const client = getGoogleClient();
  return client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] });
}

export async function loginWithGoogle(code: string) {
  let payload;
  
  if (code === 'mock-google-auth-code') {
    // MOCK DATA FOR PROTOTYPING
    payload = {
      name: 'Test User (Google)',
      email: 'test.google@student.edu',
      picture: 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff'
    };
  } else {
    // REAL GOOGLE AUTH DATA
    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token!, audience: env.GOOGLE_CLIENT_ID });
    const realPayload = ticket.getPayload();
    if (!realPayload || !realPayload.email) throw Object.assign(new Error('Google login failed'), { status: 401 });
    payload = { name: realPayload.name, email: realPayload.email, picture: realPayload.picture };
  }

  let user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    user = await UserModel.create({
      name: payload.name || 'Google User',
      email: payload.email,
      passwordHash: await hashPassword(Math.random().toString(36).slice(-10)),
      profile: { avatar: payload.picture }
    });
  }
  return { token: signToken({ userId: user.id, role: user.role }), user: serializeUser(user) };
}