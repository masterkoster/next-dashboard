import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const input = (username as string).trim().toLowerCase();

        // Find user by username or email
        let user = await prisma.user.findUnique({ where: { username: input } });
        if (!user) {
            user = await prisma.user.findUnique({ where: { email: input } });
        }

        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        let isValid = false;

        // Check bcrypt hash or plain text (with auto-upgrade)
        if (user.password.startsWith('$2')) {
            isValid = await bcrypt.compare(password, user.password);
        } else {
            isValid = user.password === password;
            if (isValid) {
                const hashed = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashed },
                });
            }
        }

        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Build JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                tier: user.tier,
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
                tier: user.tier,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── POST /api/auth/signup ──────────────────────────────────────────────────
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, email, password, name } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ error: 'Username, email, and password are required' });
            return;
        }

        // Check for existing user
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username.trim().toLowerCase() },
                    { email: email.trim().toLowerCase() },
                ],
            },
        });

        if (existing) {
            res.status(409).json({ error: 'Username or email already taken' });
            return;
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username: username.trim().toLowerCase(),
                email: email.trim().toLowerCase(),
                name: name || null,
                password: hashed,
            },
        });

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                tier: user.tier,
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                tier: user.tier,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                image: true,
                role: true,
                tier: true,
                emailVerified: true,
                homeState: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
