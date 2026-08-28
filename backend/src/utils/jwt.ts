import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthToken = { userId: string; role: string };

export function signToken(payload: AuthToken): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): AuthToken {
  return jwt.verify(token, env.JWT_SECRET) as AuthToken;
}