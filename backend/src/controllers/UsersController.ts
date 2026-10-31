import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class UsersController {
  public static getAll(req: Request, res: Response): void {
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;
    const search = (req.query.search || req.query.q) as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = datastore.getUsers({ role, status, search, page, limit });
    res.status(200).json(result);
  }

  public static getById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const user = datastore.getUserById(id);
    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: `User with identifier '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(user);
  }

  public static create(req: Request, res: Response): void {
    const { name, email, role, department, status } = req.body || {};

    if (!name || !email) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Both name and email are required fields for creating a user.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check duplicate email
    const existing = datastore.getUsers({ search: email });
    if (existing.items.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: `A user with email '${email}' already exists.`,
          status: 409,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const newUser = datastore.createUser({
      name,
      email,
      role: role || 'user',
      department: department || 'General',
      status: status || 'active',
    });

    res.status(201).json(newUser);
  }

  public static update(req: Request, res: Response): void {
    const id = String(req.params.id);
    const { name, email, role, department, status } = req.body || {};

    if (!name || !email) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Name and email are required for full resource replacement (PUT).',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const updated = datastore.updateUser(id, {
      name,
      email,
      role: role || 'user',
      department: department || 'General',
      status: status || 'active',
    });

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: `User '${id}' not found for update.`,
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
    const updated = datastore.patchUser(id, req.body || {});

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: `User '${id}' not found for patch update.`,
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
    const deleted = datastore.deleteUser(id);

    if (!deleted) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: `User '${id}' could not be deleted because it does not exist.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // 204 No Content
    res.status(204).send();
  }

  public static options(_req: Request, res: Response): void {
    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,X-API-Key');
    res.status(204).send();
  }
}
