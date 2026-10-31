import { Request, Response } from 'express';
import { requestActivityService } from '../services/RequestActivityService.js';

export class ActivityController {
  public static getLogs(req: Request, res: Response): void {
    const search = req.query.search as string | undefined;
    const method = req.query.method as string | undefined;
    const statusGroup = req.query.statusGroup as '2xx' | '3xx' | '4xx' | '5xx' | undefined;
    const service = req.query.service as string | undefined;
    const minLatency = req.query.minLatency ? parseInt(req.query.minLatency as string, 10) : undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const logs = requestActivityService.getLogs({
      search,
      method,
      statusGroup,
      service,
      minLatency,
      page,
      limit,
    });

    res.status(200).json(logs);
  }

  public static getStats(_req: Request, res: Response): void {
    const stats = requestActivityService.getStats();
    res.status(200).json(stats);
  }

  public static clearLogs(_req: Request, res: Response): void {
    requestActivityService.clear();
    res.status(200).json({
      message: 'Request activity log buffer successfully cleared.',
    });
  }
}
