import { Request, Response } from 'express';
import { config } from '../config/index.js';

export class AuthController {
  public static login(req: Request, res: Response): void {
    const { username, password } = req.body || {};

    if (!username || !password) {
      res.status(400).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Both username and password are required for authentication.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (
      (username === config.defaultBasicAuth.username && password === config.defaultBasicAuth.password) ||
      (username.length >= 3 && password.length >= 3)
    ) {
      res.status(200).json({
        status: 'authenticated',
        tokenType: 'Bearer',
        token: config.defaultAuthToken,
        apiKey: config.defaultApiKey,
        expiresInSeconds: 3600,
        user: {
          id: 'usr_1001',
          username,
          role: username === 'admin' ? 'admin' : 'developer',
          name: 'Sarah Connor',
          email: `${username}@sentinel-playground.io`,
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid username or password provided.',
        status: 401,
        requestId: res.getHeader('X-Request-ID') as string,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public static options(_req: Request, res: Response): void {
    res.setHeader('Allow', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,X-API-Key');
    res.status(204).send();
  }
}
