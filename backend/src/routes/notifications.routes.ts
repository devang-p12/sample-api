import { Router } from 'express';
import { NotificationsController } from '../controllers/NotificationsController.js';

const router = Router();

router.get('/notifications', NotificationsController.getAll);
router.head('/notifications', NotificationsController.getAll);
router.post('/notifications', NotificationsController.create);
router.options('/notifications', NotificationsController.options);

router.all('/notifications', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/notifications.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
