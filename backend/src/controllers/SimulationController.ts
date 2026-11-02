import { Request, Response } from 'express';
import { simulationService } from '../simulation/SimulationService.js';
import { datastore } from '../datastore/index.js';

export class SimulationController {
  public static getConfig(_req: Request, res: Response): void {
    const globalState = simulationService.getGlobalState();
    const activeScenario = simulationService
      .getScenarios()
      .find(s => s.id === globalState.activeScenarioId);

    const endpoints = simulationService.getEndpoints();
    const overriddenCount = endpoints.filter(ep => ep.simulationConfig.mode !== 'HEALTHY').length;

    res.status(200).json({
      global: globalState,
      activeScenario: activeScenario || null,
      stats: {
        totalEndpoints: endpoints.length,
        healthyEndpoints: endpoints.length - overriddenCount,
        simulatedEndpoints: overriddenCount,
        globalOutageActive: globalState.globalOutage,
      },
    });
  }

  public static updateGlobal(req: Request, res: Response): void {
    const patch = req.body || {};
    const updated = simulationService.updateGlobalState(patch);
    res.status(200).json({
      message: 'Global simulation state updated successfully.',
      global: updated,
    });
  }

  public static getEndpoints(_req: Request, res: Response): void {
    const endpoints = simulationService.getEndpoints();
    res.status(200).json({
      total: endpoints.length,
      endpoints,
    });
  }

  public static getEndpointById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const ep = simulationService.getEndpointById(id);
    if (!ep) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint with ID '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(ep);
  }

  public static updateEndpoint(req: Request, res: Response): void {
    const id = String(req.params.id);
    const { isActive, ...config } = req.body || {};
    const updated = simulationService.updateEndpointSimulation(id, config, isActive);
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint '${id}' not found for simulation configuration.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Simulation configuration updated for ${updated.method} ${updated.path}`,
      endpoint: updated,
    });
  }

  public static activateEndpoint(req: Request, res: Response): void {
    const id = String(req.params.id);
    const updated = simulationService.setEndpointActive(id, true);
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint '${id}' not found to activate.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Endpoint ${updated.method} ${updated.path} activated.`,
      endpoint: updated,
    });
  }

  public static deactivateEndpoint(req: Request, res: Response): void {
    const id = String(req.params.id);
    const updated = simulationService.setEndpointActive(id, false);
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint '${id}' not found to deactivate.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Endpoint ${updated.method} ${updated.path} deactivated (returns 503).`,
      endpoint: updated,
    });
  }

  public static toggleEndpoint(req: Request, res: Response): void {
    const id = String(req.params.id);
    const updated = simulationService.toggleEndpointActive(id);
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint '${id}' not found to toggle.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Endpoint ${updated.method} ${updated.path} is now ${updated.isActive !== false ? 'active' : 'deactivated'}.`,
      endpoint: updated,
    });
  }

  public static resetEndpoint(req: Request, res: Response): void {
    const id = String(req.params.id);
    const reset = simulationService.resetEndpointSimulation(id);
    if (!reset) {
      res.status(404).json({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint '${id}' not found to reset.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Endpoint ${reset.method} ${reset.path} reset to healthy defaults.`,
      endpoint: reset,
    });
  }

  public static resetAll(_req: Request, res: Response): void {
    simulationService.resetAllToHealthy();
    res.status(200).json({
      message: 'All endpoints and global simulation parameters have been reset to default healthy state.',
    });
  }

  public static getScenarios(_req: Request, res: Response): void {
    const scenarios = simulationService.getScenarios();
    const activeId = simulationService.getGlobalState().activeScenarioId;
    res.status(200).json({
      activeScenarioId: activeId,
      scenarios,
    });
  }

  public static activateScenario(req: Request, res: Response): void {
    const id = String(req.params.id);
    const activated = simulationService.activateScenario(id);
    if (!activated) {
      res.status(404).json({
        error: {
          code: 'SCENARIO_NOT_FOUND',
          message: `Scenario with ID '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json({
      message: `Scenario '${activated.name}' activated successfully.`,
      scenario: activated,
    });
  }

  public static deactivateScenario(_req: Request, res: Response): void {
    simulationService.deactivateScenario();
    res.status(200).json({
      message: 'Scenario deactivated. Platform restored to default healthy operation.',
    });
  }

  public static resetDataStore(_req: Request, res: Response): void {
    datastore.reset();
    res.status(200).json({
      message: 'In-memory datastore has been reseeded to original demo dataset.',
    });
  }
}
