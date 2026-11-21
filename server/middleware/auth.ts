import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { UserProfile } from '../../src/types/marketplace.ts';
import { titanStore, type StoredUser } from '../db/store.ts';

// Signing key from environment variable or cryptographically secure per-process fallback
const TOKEN_SECRET =
  process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16
    ? process.env.AUTH_SECRET
    : crypto.randomBytes(32).toString('hex');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function toPublicUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
}

export function signAuthToken(user: StoredUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, receivedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const receivedBuf = Buffer.from(receivedSig);
  const expectedBuf = Buffer.from(expectedSig);
  if (receivedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as TokenPayload;
    if (!decoded.sub || typeof decoded.exp !== 'number' || decoded.exp < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in to continue.' });
    return;
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    return;
  }
  const user = titanStore.findUserById(payload.sub);
  if (!user) {
    res.status(401).json({ error: 'Account not found. Please sign in again.' });
    return;
  }
  req.user = toPublicUser(user);
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      const user = titanStore.findUserById(payload.sub);
      if (user) {
        req.user = toPublicUser(user);
      }
    }
  }
  next();
}
