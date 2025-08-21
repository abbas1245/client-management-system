import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/env';

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[auth_middleware] Starting authentication...');
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    
    if (!token) {
      console.log('[auth_middleware] No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }
    
    console.log('[auth_middleware] Token found, verifying...');
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; role?: string; email?: string };
    
    // Set req.user for both TS and JS routes
    (req as any).user = { 
      id: decoded.userId, 
      _id: decoded.userId, // Add _id for legacy compatibility
      role: decoded.role, 
      email: decoded.email 
    };
    
    console.log('[auth_middleware] User authenticated:', (req as any).user);
    return next();
  } catch (err: any) {
    console.error('[auth_middleware] Authentication error:', err.message);
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}


