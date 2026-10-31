import { Router } from 'express';
import healthRoutes from './health.routes.js';
import usersRoutes from './users.routes.js';
import productsRoutes from './products.routes.js';
import ordersRoutes from './orders.routes.js';
import paymentsRoutes from './payments.routes.js';
import inventoryRoutes from './inventory.routes.js';
import notificationsRoutes from './notifications.routes.js';
import authRoutes from './auth.routes.js';
import versionedRoutes from './versioned.routes.js';
import simulationRoutes from './simulation.routes.js';
import activityRoutes from './activity.routes.js';

const router = Router();

// Simulated target services (monitored by Sentinel)
router.use('/', healthRoutes);
router.use('/', usersRoutes);
router.use('/', productsRoutes);
router.use('/', ordersRoutes);
router.use('/', paymentsRoutes);
router.use('/', inventoryRoutes);
router.use('/', notificationsRoutes);
router.use('/', authRoutes);
router.use('/', versionedRoutes);

// Control & Observability planes
router.use('/simulation', simulationRoutes);
router.use('/activity', activityRoutes);

export default router;
