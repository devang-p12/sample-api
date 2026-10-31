import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

router.post('/login', AuthController.login);
router.options('/login', AuthController.options);

router.all('/login', (req, res) => {
  res.setHeader('Allow', 'POST,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/login. Use POST.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
