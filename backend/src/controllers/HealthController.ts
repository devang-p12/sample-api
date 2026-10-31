import { Request, Response } from 'express';

export class HealthController {
  public static getSystemHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      system: 'Sentinel API Playground',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        users: 'healthy',
        products: 'healthy',
        orders: 'healthy',
        payments: 'healthy',
        inventory: 'healthy',
        notifications: 'healthy',
      },
    });
  }

  public static getPaymentsHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'payments',
      gateway: 'connected',
      activeCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
      latencyMs: 12,
      timestamp: new Date().toISOString(),
    });
  }

  public static getUsersHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'users',
      authProvider: 'internal',
      timestamp: new Date().toISOString(),
    });
  }

  public static getOrdersHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'orders',
      queueStatus: 'operational',
      timestamp: new Date().toISOString(),
    });
  }

  public static getInventoryHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'inventory',
      warehousesConnected: 3,
      timestamp: new Date().toISOString(),
    });
  }
}
