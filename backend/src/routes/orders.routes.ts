import { Router } from 'express';
import { OrdersController } from '../controllers/OrdersController.js';

const router = Router();

router.get('/orders', OrdersController.getAll);
router.head('/orders', OrdersController.getAll);
router.post('/orders', OrdersController.create);
router.options('/orders', OrdersController.options);

router.get('/orders/:id', OrdersController.getById);
router.head('/orders/:id', OrdersController.getById);
router.put('/orders/:id', OrdersController.update);
router.patch('/orders/:id', OrdersController.patch);
router.delete('/orders/:id', OrdersController.delete);
router.options('/orders/:id', OrdersController.options);

router.all('/orders', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/orders.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

router.all('/orders/:id', (req, res) => {
  res.setHeader('Allow', 'GET,PUT,PATCH,DELETE,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/orders/:id.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
