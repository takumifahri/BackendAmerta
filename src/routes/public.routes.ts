import { Router } from 'express';
import { getPlatformStats } from '../controller/public.controller.js';

const router = Router();

router.get('/stats', getPlatformStats);

export default router;
