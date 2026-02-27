import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All logbook routes require authentication
router.use(requireAuth);

// ─── GET /api/logbook ───────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
    try {
        // Check if user has Pro+ tier (admins always allowed)
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { tier: true, role: true },
        });

        const isAdmin = user?.role === 'admin' || user?.role === 'owner';
        if (!isAdmin && user?.tier !== 'proplus') {
            res.status(403).json({
                error: 'Pro+ subscription required',
                code: 'PROPLUS_REQUIRED',
            });
            return;
        }

        const entries = await prisma.logbookEntry.findMany({
            where: { userId: req.user!.id },
            orderBy: { date: 'desc' },
        });

        res.json({ entries });
    } catch (error) {
        console.error('Error fetching logbook entries:', error);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});

// ─── POST /api/logbook ──────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { tier: true, emailVerified: true, role: true },
        });

        if (!user?.emailVerified) {
            res.status(403).json({
                error: 'Please verify your email first',
                code: 'EMAIL_NOT_VERIFIED',
            });
            return;
        }

        const isAdmin = user?.role === 'admin' || user?.role === 'owner';
        if (!isAdmin && user?.tier !== 'proplus') {
            res.status(403).json({
                error: 'Pro+ subscription required',
                code: 'PROPLUS_REQUIRED',
            });
            return;
        }

        const body = req.body;

        const entry = await prisma.logbookEntry.create({
            data: {
                userId: req.user!.id,
                date: new Date(body.date),
                aircraft: body.aircraft,
                routeFrom: body.routeFrom,
                routeTo: body.routeTo,
                totalTime: body.totalTime || 0,
                picTime: body.picTime || 0,
                sicTime: body.sicTime || 0,
                soloTime: body.soloTime || 0,
                dualGiven: body.dualGiven || 0,
                dualReceived: body.dualReceived || 0,
                nightTime: body.nightTime || 0,
                instrumentTime: body.instrumentTime || 0,
                crossCountryTime: body.crossCountryTime || 0,
                dayLandings: body.dayLandings || 0,
                nightLandings: body.nightLandings || 0,
                authority: body.authority || 'FAA',
                isPending: !!body.isPending,
                isNight: (body.nightTime || 0) > 0,
                isCrossCountry: (body.crossCountryTime || 0) > 0,
                isSolo: (body.soloTime || 0) > 0,
                isDual: (body.dualReceived || 0) > 0,
                isDay: !!body.isDay,
                requiresSafetyPilot: !!body.requiresSafetyPilot,
                safetyPilotName: body.safetyPilotName || null,
                groundTrainingReceived: body.groundTrainingReceived || 0,
                simTrainingReceived: body.simTrainingReceived || 0,
                simulatedInstrumentTime: body.simulatedInstrumentTime || 0,
                trainingDeviceId: body.trainingDeviceId || null,
                trainingDeviceLocation: body.trainingDeviceLocation || null,
                isSimulator: !!body.isSimulator,
                remarks: body.remarks,
                instructor: body.instructor,
                flightPlanId: body.flightPlanId,
            },
        });

        res.json({ entry, message: 'Entry saved' });
    } catch (error) {
        console.error('Error creating logbook entry:', error);
        res.status(500).json({ error: 'Failed to save entry' });
    }
});

// ─── DELETE /api/logbook/:id ────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: 'Entry ID required' });
            return;
        }

        await prisma.logbookEntry.deleteMany({
            where: { id, userId: req.user!.id },
        });

        res.json({ message: 'Entry deleted' });
    } catch (error) {
        console.error('Error deleting logbook entry:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

export default router;
