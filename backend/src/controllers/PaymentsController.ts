import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class PaymentsController {
  public static getAll(req: Request, res: Response): void {
    const status = req.query.status as string | undefined;
    const orderId = req.query.orderId as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = datastore.getPayments({ status, orderId, page, limit });
    res.status(200).json(result);
  }

  public static getById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const payment = datastore.getPaymentById(id);
    if (!payment) {
      res.status(404).json({
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: `Payment transaction with ID '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(payment);
  }

  public static create(req: Request, res: Response): void {
    const { orderId, userId, amount, currency, paymentMethod, customerEmail } = req.body || {};

    if (!orderId || amount === undefined) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Both orderId and amount are required to authorize a payment.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const newPayment = datastore.createPayment({
      orderId,
      userId: userId || 'usr_anonymous',
      amount: Number(amount),
      currency: currency || 'USD',
      status: 'succeeded',
      paymentMethod: paymentMethod || 'credit_card',
      customerEmail: customerEmail || 'customer@example.com',
    });

    res.status(201).json(newPayment);
  }

  public static update(req: Request, res: Response): void {
    const id = String(req.params.id);
    const { orderId, userId, amount, currency, status, paymentMethod, customerEmail } = req.body || {};

    if (!orderId || amount === undefined) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Missing required parameters for PUT payment replacement.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const existing = datastore.getPaymentById(id);
    const updated = datastore.updatePayment(id, {
      orderId,
      userId: userId || 'usr_anonymous',
      amount: Number(amount),
      currency: currency || 'USD',
      status: status || 'succeeded',
      paymentMethod: paymentMethod || 'credit_card',
      transactionRef: req.body?.transactionRef || existing?.transactionRef || `txn_sentinel_${Date.now()}`,
      customerEmail: customerEmail || 'customer@example.com',
    });

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: `Payment '${id}' not found for update.`,
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
    const updated = datastore.patchPayment(id, req.body || {});

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: `Payment '${id}' not found for patch update.`,
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
    const deleted = datastore.deletePayment(id);

    if (!deleted) {
      res.status(404).json({
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: `Payment '${id}' could not be deleted because it does not exist.`,
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
