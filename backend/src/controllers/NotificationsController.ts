import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class NotificationsController {
  public static getAll(req: Request, res: Response): void {
    const userId = req.query.userId as string | undefined;
    const notifications = datastore.getNotifications(userId);
    res.status(200).json({
      total: notifications.length,
      items: notifications,
    });
  }

  public static create(req: Request, res: Response): void {
    const { userId, title, message, channel } = req.body || {};

    if (!userId || !title || !message) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'userId, title, and message are required fields.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const notif = datastore.createNotification({
      userId,
      title,
      message,
      channel: channel || 'email',
      status: 'delivered',
      read: false,
    });

    res.status(201).json(notif);
  }

  public static options(_req: Request, res: Response): void {
    res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,X-API-Key');
    res.status(204).send();
  }
}
