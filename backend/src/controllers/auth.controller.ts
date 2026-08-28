import type { Request, Response } from 'express';
import * as service from '../services/auth.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function signup(request: Request, response: Response) { sendSuccess(response, 201, await service.signup(request.body.name, request.body.email, request.body.password)); }
export async function login(request: Request, response: Response) { sendSuccess(response, 200, await service.login(request.body.email, request.body.password)); }
export async function logout(_request: Request, response: Response) { sendSuccess(response, 200, { loggedOut: true }); }
export async function me(request: Request, response: Response) { sendSuccess(response, 200, { user: await service.getCurrentUser(request.user!.id) }); }

export async function googleAuth(_request: Request, response: Response) {
  response.redirect(service.getGoogleAuthUrl());
}

export async function googleCallback(request: Request, response: Response) {
  const code = request.query.code;
  if (typeof code !== 'string') return response.redirect('/login.html?error=invalid_google_code');
  try {
    const result = await service.loginWithGoogle(code);
    response.redirect(`/login.html?token=${result.token}`);
  } catch (error) {
    response.redirect('/login.html?error=google_auth_failed');
  }
}