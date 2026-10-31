import { Request, Response } from 'express';
import { datastore } from '../datastore/index.js';

export class ProductsController {
  public static getAll(req: Request, res: Response): void {
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const search = (req.query.search || req.query.q) as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = datastore.getProducts({ category, status, search, sortBy, sortOrder, page, limit });
    res.status(200).json(result);
  }

  public static search(req: Request, res: Response): void {
    const q = (req.query.q || req.query.query || '') as string;
    if (!q) {
      res.status(400).json({
        error: {
          code: 'MISSING_SEARCH_QUERY',
          message: 'Query parameter q is required for product search.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const matches = datastore.searchProducts(q);
    res.status(200).json({
      query: q,
      totalMatches: matches.length,
      items: matches,
    });
  }

  public static getLarge(req: Request, res: Response): void {
    const count = Math.min(2000, Math.max(10, parseInt(req.query.count as string || '500', 10)));
    const categories = ['Hardware', 'Accessories', 'Audio', 'Monitors', 'Power', 'Peripherals'];
    const items = [];

    for (let i = 1; i <= count; i++) {
      items.push({
        id: `bench_prd_${i}`,
        sku: `SN-BENCH-${String(i).padStart(5, '0')}`,
        name: `Benchmark Simulated Hardware Item #${i}`,
        description: `Synthetic payload item ${i} designed for high-throughput load and serialization benchmarks in Sentinel.`,
        price: parseFloat((10 + (i % 250) * 4.99).toFixed(2)),
        category: categories[i % categories.length],
        stock: 50 + (i % 300),
        status: i % 10 === 0 ? 'out_of_stock' : i % 5 === 0 ? 'low_stock' : 'in_stock',
        rating: parseFloat((3.5 + (i % 15) * 0.1).toFixed(1)),
        metadata: {
          benchmarkRun: true,
          serial: `SER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          generatedAt: new Date().toISOString(),
          tags: ['synthetic', 'loadtest', 'sentinel-bench', `cat-${i % 8}`],
        },
      });
    }

    res.status(200).json({
      itemCount: count,
      benchmarkMode: true,
      timestamp: new Date().toISOString(),
      items,
    });
  }

  public static getById(req: Request, res: Response): void {
    const id = String(req.params.id);
    const product = datastore.getProductById(id);
    if (!product) {
      res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' was not found.`,
          status: 404,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.status(200).json(product);
  }

  public static create(req: Request, res: Response): void {
    const { name, description, price, category, stock, sku, status, rating, tags } = req.body || {};

    if (!name || price === undefined) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Both name and price are required to create a product.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const newProduct = datastore.createProduct({
      name,
      description: description || '',
      price: Number(price),
      category: category || 'Hardware',
      stock: Number(stock || 0),
      sku: sku || `SN-CUSTOM-${Date.now().toString().slice(-4)}`,
      status: status || 'in_stock',
      rating: rating !== undefined ? Number(rating) : 5.0,
      tags: Array.isArray(tags) ? tags : ['custom'],
    });

    res.status(201).json(newProduct);
  }

  public static update(req: Request, res: Response): void {
    const id = String(req.params.id);
    const { name, description, price, category, stock, sku, status, rating, tags } = req.body || {};

    if (!name || price === undefined) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Both name and price are required for PUT product replacement.',
          status: 400,
          requestId: res.getHeader('X-Request-ID') as string,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const updated = datastore.updateProduct(id, {
      name,
      description: description || '',
      price: Number(price),
      category: category || 'Hardware',
      stock: Number(stock || 0),
      sku: sku || `SN-${id}`,
      status: status || 'in_stock',
      rating: rating !== undefined ? Number(rating) : 5.0,
      tags: Array.isArray(tags) ? tags : ['custom'],
    });

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' not found for update.`,
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
    const updated = datastore.patchProduct(id, req.body || {});

    if (!updated) {
      res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' not found for patch update.`,
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
    const deleted = datastore.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product '${id}' could not be deleted because it does not exist.`,
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
