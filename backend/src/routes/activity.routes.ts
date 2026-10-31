import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController.js';

const router = Router();

router.get('/', ActivityController.getLogs);
router.get('/stats', ActivityController.getStats);
router.delete('/', ActivityController.clearLogs);

export default router;
