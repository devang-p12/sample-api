import { Router } from 'express';
import { UsersController } from '../controllers/UsersController.js';

const router = Router();

router.get('/users', UsersController.getAll);
router.head('/users', UsersController.getAll);
router.post('/users', UsersController.create);
router.options('/users', UsersController.options);

router.get('/users/:id', UsersController.getById);
router.head('/users/:id', UsersController.getById);
router.put('/users/:id', UsersController.update);
router.patch('/users/:id', UsersController.patch);
router.delete('/users/:id', UsersController.delete);
router.options('/users/:id', UsersController.options);

router.all('/users', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/users.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

router.all('/users/:id', (req, res) => {
  res.setHeader('Allow', 'GET,PUT,PATCH,DELETE,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/users/:id.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
