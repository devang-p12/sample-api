import { Router } from 'express';
import { SimulationController } from '../controllers/SimulationController.js';

const router = Router();

// Configuration & Global Controls
router.get('/config', SimulationController.getConfig);
router.put('/global', SimulationController.updateGlobal);
router.post('/reset', SimulationController.resetAll);

// Endpoint-specific Simulation Controls
router.get('/endpoints', SimulationController.getEndpoints);
router.get('/endpoints/:id', SimulationController.getEndpointById);
router.put('/endpoints/:id', SimulationController.updateEndpoint);
router.post('/endpoints/:id/reset', SimulationController.resetEndpoint);
router.post('/endpoints/:id/activate', SimulationController.activateEndpoint);
router.post('/endpoints/:id/deactivate', SimulationController.deactivateEndpoint);
router.post('/endpoints/:id/toggle', SimulationController.toggleEndpoint);

// Scenarios & Chaos Controls
router.get('/scenarios', SimulationController.getScenarios);
router.post('/scenarios/:id/activate', SimulationController.activateScenario);
router.post('/scenarios/:id/deactivate', SimulationController.deactivateScenario);
router.post('/scenarios/deactivate', SimulationController.deactivateScenario);
router.post('/deactivate', SimulationController.deactivateScenario);

// Datastore reset
router.post('/datastore/reset', SimulationController.resetDataStore);

export default router;
