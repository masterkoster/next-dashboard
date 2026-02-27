import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
                role: string;
                tier: string;
            };
        }
    }
}

const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-insecure-secret';

if (!JWT_SECRET || JWT_SECRET === 'dev-insecure-secret') {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing AUTH_SECRET in production');
    }
    console.warn('⚠️  AUTH_SECRET is not set. Using insecure default for development.');
}

export { JWT_SECRET };

/**
 * Middleware: Verify JWT from Authorization header and attach user to req.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as {
            id: string;
            username: string;
            email: string;
            role: string;
            tier: string;
        };

        req.user = {
            id: payload.id,
            username: payload.username,
            email: payload.email,
            role: payload.role,
            tier: payload.tier,
        };

        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
}

/**
 * Middleware: Optional auth — attaches user if token present, but doesn't block.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.slice(7);
            const payload = jwt.verify(token, JWT_SECRET) as {
                id: string;
                username: string;
                email: string;
                role: string;
                tier: string;
            };
            req.user = {
                id: payload.id,
                username: payload.username,
                email: payload.email,
                role: payload.role,
                tier: payload.tier,
            };
        } catch {
            // Token invalid — continue without user
        }
    }

    next();
}
