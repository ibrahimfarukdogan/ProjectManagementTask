import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/auth.js';


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export default function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Admins only' });
  return;
}