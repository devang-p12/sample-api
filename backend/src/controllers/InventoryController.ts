import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class InventoryController {
  public static getAll(_req: Request, res: Response): void {
    const items = datastore.getInventory();
    res.status(200).json({
      total: items.length,
      items,
    });
  }

  public static getById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const item = datastore.getInventoryById(id);
    if (!item) {
      res.status(404).json({
        error: {
          code: 'INVENTORY_NOT_FOUND',
          message: `Inventory item '${id}' not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(item);
  }

  public static update(req: Request, res: Response): void {
    const id = String(req.params.id);
    const updated = datastore.updateInventory(id, req.body || {});
    if (!updated) {
      res.status(404).json({
        error: {
          code: 'INVENTORY_NOT_FOUND',
          message: `Inventory item '${id}' not found for update.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(updated);
  }

  public static options(_req: Request, res: Response): void {
    res.setHeader('Allow', 'GET,PUT,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,X-API-Key');
    res.status(204).send();
  }
}
