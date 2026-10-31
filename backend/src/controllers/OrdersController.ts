import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class OrdersController {
  public static getAll(req: Request, res: Response): void {
    const status = req.query.status as string | undefined;
    const userId = req.query.userId as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = datastore.getOrders({ status, userId, page, limit });
    res.status(200).json(result);
  }

  public static getById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const order = datastore.getOrderById(id);
    if (!order) {
      res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order with ID '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(order);
  }

  public static create(req: Request, res: Response): void {
    const { userId, customerName, items, paymentMethod, shippingAddress } = req.body || {};

    if (!userId || !customerName || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'userId, customerName, and non-empty items array are required to place an order.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    const newOrder = datastore.createOrder({
      userId,
      customerName,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      currency: 'USD',
      status: 'pending',
      paymentMethod: paymentMethod || 'credit_card',
      shippingAddress: shippingAddress || '123 Cloud Avenue, Datacenter City',
    });

    res.status(201).json(newOrder);
  }

  public static update(req: Request, res: Response): void {
    const id = String(req.params.id);
    const { userId, customerName, items, totalAmount, currency, status, paymentMethod, shippingAddress } = req.body || {};

    if (!userId || !customerName || !items) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Missing required fields for PUT order replacement.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const updated = datastore.updateOrder(id, {
      userId,
      customerName,
      items,
      totalAmount: Number(totalAmount || 0),
      currency: currency || 'USD',
      status: status || 'pending',
      paymentMethod: paymentMethod || 'credit_card',
      shippingAddress: shippingAddress || '',
    });

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order '${id}' not found for update.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json(updated);
  }

  public static patch(req: Request, res: Response): void {
    const id = String(req.params.id);
    const updated = datastore.patchOrder(id, req.body || {});

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order '${id}' not found for patch update.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json(updated);
  }

  public static delete(req: Request, res: Response): void {
    const id = String(req.params.id);
    const deleted = datastore.deleteOrder(id);

    if (!deleted) {
      res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order '${id}' could not be deleted because it does not exist.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(204).send();
  }

  public static options(_req: Request, res: Response): void {
    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,X-API-Key');
    res.status(204).send();
  }
}
