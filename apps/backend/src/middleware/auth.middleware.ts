import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

export function verifyArtisan(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    verifyToken(req, res, () => {
      if (req.userRole !== 'artisan') {
        return res.status(403).json({
          success: false,
          error: 'Only artisans can access this resource',
        });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

export function verifyClient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    verifyToken(req, res, () => {
      if (req.userRole !== 'client') {
        return res.status(403).json({
          success: false,
          error: 'Only clients can access this resource',
        });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}
