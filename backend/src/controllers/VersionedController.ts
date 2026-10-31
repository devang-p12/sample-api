import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class VersionedController {
  public static getV1Products(req: Request, res: Response): void {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const result = datastore.getProducts({ page, limit });

    res.status(200).json({
      apiVersion: '1.0',
      total: result.total,
      page: result.page,
      limit: result.limit,
      products: result.items.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        sku: p.sku,
      })),
    });
  }

  public static getV2Products(req: Request, res: Response): void {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const result = datastore.getProducts({ page, limit });

    res.status(200).json({
      apiVersion: '2.0',
      total: result.total,
      page: result.page,
      limit: result.limit,
      products: result.items.map(p => ({
        id: p.id,
        productName: p.name,
        overview: p.description,
        amount: p.price,
        currency: 'USD',
        category: p.category,
        inventoryCount: p.stock,
        stockStatus: p.status,
        productSku: p.sku,
      })),
    });
  }
}
