# Sentinel API Playground

**Sentinel API Playground** is a standalone, production-grade API simulation platform engineered specifically to serve as a realistic target environment for **Sentinel** — an enterprise API monitoring, testing, reliability, alerting, and high-throughput load-testing platform.

Unlike frontend-only mock tools, the Sentinel API Playground runs a **real HTTP backend** exposing authentic REST endpoints with real in-memory CRUD operations, state persistence, HTTP status code injection, latency simulation, intermittent failure injection, rate limiting, and response schema versioning.

---

## Architecture Overview

```text
       Sentinel Monitoring & Load Testing
                      |
                      | Real HTTP Requests (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
                      v
        Sentinel API Playground (:4000)
 ┌─────────────────────────────────────────────────────────┐
 │                   Simulation Engine                     │
 │  ┌─────────────────┐ ┌───────────────┐ ┌─────────────┐  │
 │  │ Global Outage   │ │ Rate Limiter  │ │ Auth Engine │  │
 │  └─────────────────┘ └───────────────┘ └─────────────┘  │
 │  ┌─────────────────┐ ┌───────────────┐ ┌─────────────┐  │
 │  │ Latency Inject  │ │ Failure Prob  │ │ Schema V1/V2│  │
 │  └─────────────────┘ └───────────────┘ └─────────────┘  │
 ├─────────────────────────────────────────────────────────┤
 │                  In-Memory Datastore                    │
 │    Users • Products • Orders • Payments • Inventory     │
 └─────────────────────────────────────────────────────────┘
                      ^
                      | Web Dashboard (:5173)
         Playground Observability Dashboard
```

---

## Key Capabilities

1. **Real HTTP Backend & Full Method Support**:
   - Complete support for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`.
   - `405 Method Not Allowed` enforcement with explicit `Allow` headers for unsupported methods.
   - `HEAD` requests return identical response headers without body payloads.
   - `OPTIONS` returns CORS and `Allow` headers.

2. **Real CRUD & In-Memory State**:
   - Modifying resources via `POST`, `PUT`, `PATCH`, and `DELETE` immediately affects subsequent `GET` requests.
   - Deleting a resource returns `204 No Content`; subsequent `GET` requests return `404 Not Found`.

3. **Multi-Domain Target Services**:
   - **Health**: `/api/health`, `/api/payments/health`, `/api/users/health`, `/api/orders/health`, `/api/inventory/health`
   - **Payments**: Charge authorization, transaction queries, refunds, and health probes
   - **Products**: Hardware catalog, pagination, sorting, search (`/api/products/search?q=laptop`), and large payload benchmarks (`/api/products/large`)
   - **Users**: User profiles, RBAC roles, status management
   - **Orders**: Purchase order creation, order tracking, item allocation
   - **Inventory**: Stock availability, warehouse reservations
   - **Notifications**: Multi-channel alert dispatch (Email, SMS, Webhook, Push)
   - **Auth**: `/api/login` returning bearer JWT tokens
   - **API Versioning**: `/api/v1/products` and `/api/v2/products` demonstrating schema evolution

4. **Centralized Simulation Engine**:
   - **Modes**: `HEALTHY`, `DELAYED`, `FAILING`, `INTERMITTENT`, `RATE_LIMITED`, `SCHEMA_CHANGED`, `UNAVAILABLE`, `AUTH_REQUIRED`, `DATABASE_SLOW`, `DATABASE_FAILURE`, `GATEWAY_TIMEOUT`.
   - **Status Code Simulation**: 200, 201, 202, 204, 400, 401, 403, 404, 408, 409, 422, 429, 500, 502, 503, 504.
   - **Latency Simulation**: Fixed (0–60,000ms), Random range (min-max), and Timeout simulation.
   - **Failure Simulation**: Configurable percentage probability (0–100%) and error codes.
   - **Rate Limiting**: Sliding window request limit per key returning `429 Too Many Requests` with `X-RateLimit-*` headers.
   - **Schema Alteration**: Live schema mutation (Schema V1, Schema V2, and Broken Schema).

5. **Predefined Scenarios**:
   - Normal Operation
   - Slow API Latency Spike
   - Payment API Degradation (2.5s delay)
   - Payment API Outage (503 Service Unavailable)
   - Intermittent Payment Failures (35% fault probability)
   - Aggressive Rate Limiting
   - Response Schema Breaking Change
   - Authentication Enforced & Rejecting
   - Database Cluster Outage
   - Gateway Timeout / Bad Gateway

6. **Full Ingress Telemetry & Tracing**:
   - Every request is tagged with an `X-Request-ID` (preserved if client supplied, or generated).
   - Telemetry recorded: Timestamp, Method, Path, Status, Response Time ms, Request/Response payload sizes, IP, User-Agent, and Simulation Mode.
   - Real-time Activity Log with search, filters, and inspector drawer.

7. **Interactive API Testing Console**:
   - Postman-like tester with variable interpolation (`{{baseUrl}}`, `{{token}}`, `{{userId}}`, `{{productId}}`, `{{orderId}}`).
   - One-click template loader for all playground endpoints.
   - cURL generator for every endpoint.

---

## Project Structure

```text
sentinel-api-playground/
├── frontend/
│   ├── src/
│   │   ├── components/        # Badge, Button, Card, StatCard, Modal, JsonViewer
│   │   ├── pages/             # Dashboard, Services, Endpoints, Scenarios, Activity, ApiTester, Docs, Settings
│   │   ├── layouts/           # RootLayout with persistent live status & navigation
│   │   ├── services/          # Client API service
│   │   ├── types/             # TypeScript interfaces
│   │   ├── router/            # React Router v7 configuration
│   │   ├── lib/               # Utility helpers & cURL generator
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── config/            # Centralized environment variables
│   │   ├── types/             # TypeScript models & simulation interfaces
│   │   ├── datastore/         # In-memory datastore with mock seeds & CRUD
│   │   ├── simulation/        # Centralized SimulationService & SimulationMiddleware
│   │   ├── services/          # RequestActivityService with ring-buffer & metrics
│   │   ├── controllers/       # Health, Users, Products, Orders, Payments, Inventory, Notifications, Auth, Versioned
│   │   ├── routes/            # REST routes with 405 Method Not Allowed guards
│   │   ├── utils/             # OpenAPI 3.0 specification generator
│   │   └── server.ts          # Express server with CORS & Swagger UI
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── test-simulation.cjs        # Automated end-to-end verification test suite
├── docker-compose.yml         # Container orchestration
├── README.md
└── package.json
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x

### 1. Install Dependencies

```bash
# In the repository root
npm run dev:backend    # Starts backend on http://localhost:4000
npm run dev:frontend   # Starts frontend on http://localhost:5173
```

Or install and run individually:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### 2. Verify System Health

Run the automated test suite to verify end-to-end functionality:

```bash
node test-simulation.cjs
```

---

## Running with Docker Compose

To start the complete Sentinel API Playground stack (backend + frontend with Nginx proxy):

```bash
docker compose up --build
```

Access the interfaces:
- **Playground Dashboard**: `http://localhost:5173`
- **Playground Backend API**: `http://localhost:4000/api`
- **Swagger Documentation**: `http://localhost:4000/docs`
- **OpenAPI 3.0 Spec**: `http://localhost:4000/openapi.json`

---

## Environment Variables

### Backend Configuration

Create `backend/.env` (optional, defaults provided):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port for the Express backend server |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin for the frontend |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `MAX_REQUEST_LOGS` | `1000` | Circular buffer capacity for request logs |
| `DEFAULT_AUTH_TOKEN` | `sentinel-mock-jwt-token-xyz` | Default valid Bearer token for auth simulation |
| `DEFAULT_API_KEY` | `sentinel-api-key-live-12345` | Default valid API key |
| `BASIC_AUTH_USER` | `admin` | Default basic auth username |
| `BASIC_AUTH_PASSWORD` | `sentinel123` | Default basic auth password |

---

## Connecting Sentinel to the Playground

The Sentinel API Playground provides stable, deterministic HTTP endpoints designed for Sentinel's uptime monitors, test runners, and load injectors.

### 1. Uptime Probes

Configure Sentinel health monitors against:
- Primary System Probe: `http://localhost:4000/api/health`
- Payment Gateway Probe: `http://localhost:4000/api/payments/health`
- Orders Service Probe: `http://localhost:4000/api/orders/health`
- Expected Status: `200 OK`
- Interval: `5 seconds` / `10 seconds`

### 2. REST API Synthetic Tests

Configure Sentinel API test suites against:
- `GET http://localhost:4000/api/products` (Assert status 200, check `items` array)
- `POST http://localhost:4000/api/payments` (Assert status 201, check `transactionRef`)

### 3. High-Throughput Load Testing

Target Sentinel load tests against:
- `GET http://localhost:4000/api/products/large?count=500` (Tests payload serialization and throughput)
- `POST http://localhost:4000/api/payments` (Tests transaction rate and p95 latency under concurrency)

---

## Step 59 Demonstration Flow: Degradation → Outage → Alert → Incident → Recovery

The completed playground supports the exact demonstration flow:

1. **Step 1 — Normal State**:
   - Sentinel monitors show all services **Healthy**, `< 50ms` latency, and `0%` error rate.
2. **Step 2 — Introduce Latency**:
   - On the Playground Dashboard, click **1. Introduce Latency (2.5s)** or activate `Payment API Degradation`.
   - `POST /api/payments` and `GET /api/payments/health` now take `2500ms`.
   - Sentinel detects high latency and flags the Payment service as **Degraded**.
3. **Step 3 — Introduce Outage**:
   - Click **2. Introduce Outage (503)** or activate `Payment API Outage`.
   - `POST /api/payments` immediately returns `503 Service Unavailable`.
   - Sentinel flags the Payment service as **Down**.
4. **Step 4 — Alert**:
   - Sentinel alert rule fires (e.g. *Payment error rate > 50%*).
5. **Step 5 — Incident**:
   - Sentinel automatically creates a high-severity incident.
6. **Step 6 — Notification**:
   - Sentinel dispatches alert notifications.
7. **Step 7 — API Testing**:
   - Use Sentinel's or the Playground's API Tester to execute `POST /api/payments`, confirming the `503` response.
8. **Step 8 — Load Test**:
   - Execute a load test against `/api/payments` and observe error rates, throughput, and p99 metrics.
9. **Step 9 — Recovery**:
   - On the Playground Dashboard, click **3. Recovery (200 OK)** or **Reset All**.
   - Payments return to `200 OK` with sub-50ms latency.
   - Sentinel detects recovery, automatically closes the alert, and resolves the incident.

---

## API Documentation

- **Interactive Swagger UI**: `http://localhost:4000/docs`
- **Raw OpenAPI 3.0 Schema**: `http://localhost:4000/openapi.json`
- **Direct in-dashboard documentation**: `http://localhost:5173/docs`

---

## License

MIT License. Engineered for Sentinel API Monitoring & Reliability Testing.
