import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';

const router = Router();

router.get('/health', HealthController.getSystemHealth);
router.head('/health', HealthController.getSystemHealth);

router.get('/payments/health', HealthController.getPaymentsHealth);
router.head('/payments/health', HealthController.getPaymentsHealth);

router.get('/users/health', HealthController.getUsersHealth);
router.head('/users/health', HealthController.getUsersHealth);

router.get('/orders/health', HealthController.getOrdersHealth);
router.head('/orders/health', HealthController.getOrdersHealth);

router.get('/inventory/health', HealthController.getInventoryHealth);
router.head('/inventory/health', HealthController.getInventoryHealth);

router.all('/health', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,HEAD,OPTIONS');
    return res.status(204).send();
  }
  res.setHeader('Allow', 'GET,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP ${req.method} is not supported on this health probe.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
