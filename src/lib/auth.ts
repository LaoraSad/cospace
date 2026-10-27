import { NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from './cookies';

import { verifyAccessToken, TokenPayload } from './jwt';
import { Role } from '@prisma/client';

export interface AuthSession {
  user: TokenPayload;
}


//Extrae y valida el token de acceso de las cookies de la petición

export async function getAuthSession(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifyAccessToken(token);
}


//Valida que el usuario tenga un rol específico

export function hasRole(user: TokenPayload, role: Role): boolean {
  return user.role === role;
}