import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController.js';

const router = Router();

router.get('/products/search', ProductsController.search);
router.head('/products/search', ProductsController.search);

router.get('/products/large', ProductsController.getLarge);
router.head('/products/large', ProductsController.getLarge);

router.get('/products', ProductsController.getAll);
router.head('/products', ProductsController.getAll);
router.post('/products', ProductsController.create);
router.options('/products', ProductsController.options);

router.get('/products/:id', ProductsController.getById);
router.head('/products/:id', ProductsController.getById);
router.put('/products/:id', ProductsController.update);
router.patch('/products/:id', ProductsController.patch);
router.delete('/products/:id', ProductsController.delete);
router.options('/products/:id', ProductsController.options);

router.all('/products', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/products.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

router.all('/products/:id', (req, res) => {
  res.setHeader('Allow', 'GET,PUT,PATCH,DELETE,HEAD,OPTIONS');
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method ${req.method} is not allowed on /api/products/:id.`,
      status: 405,
      requestId: res.getHeader('X-Request-ID') as string,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
