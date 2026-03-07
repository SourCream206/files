import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: string;
}

export interface AuthedRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ message: 'Invalid Authorization header' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

