import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';

const router = Router();

router.get('/inventory', InventoryController.getAll);
router.head('/inventory', InventoryController.getAll);
router.options('/inventory', InventoryController.options);

router.get('/inventory/:id', InventoryController.getById);
router.head('/inventory/:id', InventoryController.getById);
router.put('/inventory/:id', InventoryController.update);
router.options('/inventory/:id', InventoryController.options);

router.all('/inventory', (req, res) => {
  res.setHeader('Allow', 'GET,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/inventory.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
