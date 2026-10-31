import { Router } from 'express';
import { PaymentsController } from '../controllers/PaymentsController.js';

const router = Router();

router.get('/payments', PaymentsController.getAll);
router.head('/payments', PaymentsController.getAll);
router.post('/payments', PaymentsController.create);
router.options('/payments', PaymentsController.options);

router.get('/payments/:id', PaymentsController.getById);
router.head('/payments/:id', PaymentsController.getById);
router.put('/payments/:id', PaymentsController.update);
router.patch('/payments/:id', PaymentsController.patch);
router.delete('/payments/:id', PaymentsController.delete);
router.options('/payments/:id', PaymentsController.options);

router.all('/payments', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/payments.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

router.all('/payments/:id', (req, res) => {
  res.setHeader('Allow', 'GET,PUT,PATCH,DELETE,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/payments/:id.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
