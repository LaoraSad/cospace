import { jwtVerify, SignJWT } from 'jose';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

function getSecretKey(envVarName: string): Uint8Array {
  const secret = process.env[envVarName];
  if (!secret || secret.trim() === '') {
    throw new Error(
      `[Seguridad Crítica] La variable de entorno ${envVarName} no está definida. La aplicación no puede iniciar ni firmar tokens sin esta clave.`
    );
  }
  return new TextEncoder().encode(secret);
}

const ACCESS_SECRET = getSecretKey('JWT_ACCESS_SECRET');
const REFRESH_SECRET = getSecretKey('JWT_REFRESH_SECRET');

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })//clave simétrica se usa tanto para firmar el token como para verificarlo.
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}