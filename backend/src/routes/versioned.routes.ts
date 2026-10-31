import { Router } from 'express';
import { VersionedController } from '../controllers/VersionedController.js';

const router = Router();

router.get('/v1/products', VersionedController.getV1Products);
router.head('/v1/products', VersionedController.getV1Products);

router.get('/v2/products', VersionedController.getV2Products);
router.head('/v2/products', VersionedController.getV2Products);

export default router;
