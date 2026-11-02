import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { openApiSpec } from './utils/openapi.js';
import { simulationMiddleware } from './simulation/SimulationMiddleware.js';
import apiRouter from './routes/index.js';

const app = express();

// Set Allow header on all OPTIONS requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
  }
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-API-Key',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-Chaos-Downtime',
      'X-Chaos-Latency',
      'X-Chaos-Status',
      'X-Chaos-Message',
      'X-Chaos-Schema',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Response-Time',
      'X-Simulation-Mode',
      'X-Service',
      'X-API-Version',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Allow',
    ],
    credentials: true,
  })
);

// Content-Type & Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: ['text/*', 'application/xml'] }));

// OpenAPI Spec and Swagger UI
app.get('/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openApiSpec);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'Sentinel API Playground — Swagger Documentation',
}));

// Root health & welcome info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Sentinel API Playground',
    description: 'Realistic target API environment for Sentinel monitoring and reliability testing.',
    version: '1.0.0',
    documentation: '/docs',
    openApiSpec: '/openapi.json',
    healthCheck: '/api/health',
    status: 'operational',
  });
});

// Central Simulation Middleware
app.use('/api', simulationMiddleware);

// Main API Router
app.use('/api', apiRouter);

// Standardized 404 Handler for API
app.use('/api/*', (req: Request, res: Response) => {
  const reqId = (res.getHeader('X-Request-ID') as string) || `req_${Date.now()}`;
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on Sentinel API Playground.`,
      status: 404,
      requestId: reqId,
      timestamp: new Date().toISOString(),
    },
  });
});

// Centralized Unhandled Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Sentinel Playground Server Error]:', err);
  const reqId = (res.getHeader('X-Request-ID') as string) || `req_err_${Date.now()}`;
  const status = err.status || 500;

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred processing the API request.',
      status,
      requestId: reqId,
      timestamp: new Date().toISOString(),
    },
  });
});

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` Sentinel API Playground running on port ${config.port}`);
  console.log(` API Base URL:       http://localhost:${config.port}/api`);
  console.log(` Health Probe:       http://localhost:${config.port}/api/health`);
  console.log(` Payments Health:    http://localhost:${config.port}/api/payments/health`);
  console.log(` Swagger Docs:       http://localhost:${config.port}/docs`);
  console.log(` OpenAPI Spec:       http://localhost:${config.port}/openapi.json`);
  console.log(`=======================================================`);
});

export default app;
