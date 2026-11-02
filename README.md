# Sentinel API Playground

**Sentinel API Playground** is a standalone, production-grade API simulation platform engineered specifically to serve as a realistic target environment for **Sentinel** — an enterprise API monitoring, testing, reliability, alerting, and high-throughput load-testing platform.

Unlike frontend-only mock tools, the Sentinel API Playground runs a **real HTTP backend** exposing authentic REST endpoints with real in-memory CRUD operations, state persistence, HTTP status code injection, latency simulation, intermittent failure injection, rate limiting, and response schema versioning.

---

## ⚡ Quick Start: How to Run This Project

### Option 1: Run Everything with a Single Command (Recommended)

From the root directory:

```bash
# 1. Install all dependencies (root, backend, and frontend)
npm run install:all

# 2. Start both Backend (:4000) and Frontend (:5173) concurrently
npm run dev
```

That's it! Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option 2: Run with Docker Compose

If you have Docker installed, you can start the entire platform with one command:

```bash
docker compose up --build
```

To stop:
```bash
docker compose down
```

---

### Option 3: Run Frontend & Backend in Separate Terminals

#### Terminal 1 — Backend (Port 4000)
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 — Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

### Option 4: Run Automated Verification Tests

To verify that all REST endpoints, CRUD operations, chaos scenarios, and telemetry work as expected:

```bash
npm test
```

---

## 🌐 Application URLs

| Interface | URL | Description |
|---|---|---|
| **Web Dashboard** | [http://localhost:5173](http://localhost:5173) | Observability UI, Endpoint Explorer, Scenarios, Activity Log, API Tester |
| **Backend REST APIs** | [http://localhost:4000/api](http://localhost:4000/api) | Real target HTTP endpoints monitored by Sentinel |
| **System Health Probe** | [http://localhost:4000/api/health](http://localhost:4000/api/health) | Primary system health check probe |
| **Payments Health Probe** | [http://localhost:4000/api/payments/health](http://localhost:4000/api/payments/health) | Dedicated payment gateway health check |
| **Interactive Swagger Docs** | [http://localhost:4000/docs](http://localhost:4000/docs) | Live Swagger UI documentation & "Try It Out" |
| **OpenAPI 3.0 Schema** | [http://localhost:4000/openapi.json](http://localhost:4000/openapi.json) | Machine-readable OpenAPI 3.0 specification |

---

## 🏗️ Architecture Overview

```text
       Sentinel Monitoring & Load Testing
                      │
                      │ Real HTTP Requests (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
                      ▼
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
                      ▲
                      │ Web Dashboard (:5173)
         Playground Observability Dashboard
```

---

## 🌟 Key Capabilities

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

## 📁 Project Structure

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

## ⚙️ Environment Variables

### Backend Configuration

Create `backend/.env` (optional, default fallbacks provided):

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

## 🔗 Connecting Sentinel to the Playground

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

## 🔐 How to Test Authentication

The Sentinel API Playground provides comprehensive simulation for multiple authentication schemes:

### 1. Generating Tokens with the Login API
```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sentinel123"}'
```
Response:
```json
{
  "status": "authenticated",
  "tokenType": "Bearer",
  "token": "sentinel-mock-jwt-token-xyz",
  "apiKey": "sentinel-api-key-live-12345",
  "expiresInSeconds": 3600,
  "user": { "id": "usr_1001", "username": "admin", "role": "admin" }
}
```

### 2. Testing Auth with Scenarios
1. Go to **Scenarios** in the UI dashboard ([http://localhost:5173/scenarios](http://localhost:5173/scenarios)) or call:
   ```bash
   curl -X POST http://localhost:4000/api/simulation/scenarios/auth-failure/activate
   ```
2. Any request to protected endpoints (`/api/users`, `/api/orders`, `/api/payments`) without a valid token will fail:
   ```bash
   # Fails with 401 Unauthorized
   curl -i http://localhost:4000/api/users

   # Succeeds with 200 OK
   curl -i -H "Authorization: Bearer super-secret-valid-token" http://localhost:4000/api/users
   ```
3. To deactivate the auth failure scenario and return to nominal:
   ```bash
   curl -X POST http://localhost:4000/api/simulation/deactivate
   ```

### 3. Testing Auth on Individual Endpoints
1. Open the **Endpoints** page ([http://localhost:5173/endpoints](http://localhost:5173/endpoints)).
2. Click **Configure** on any endpoint (e.g. `GET /api/products`).
3. Check **Enforce Authentication** and choose:
   - **Bearer Token**: `Authorization: Bearer sentinel-mock-jwt-token-xyz`
   - **Basic Auth**: `Authorization: Basic YWRtaW46c2VudGluZWwxMjM=` (`admin:sentinel123`)
   - **API Key**: Header `X-API-Key: sentinel-api-key-live-12345` or query `?apiKey=...`
4. Click **Save & Apply Simulation**.

### 4. Testing with the Built-in API Tester
1. Navigate to the **API Tester** tab ([http://localhost:5173/test](http://localhost:5173/test)).
2. Select the **Auth** tab below the URL bar.
3. Switch between **Bearer Token**, **Basic Auth**, and **API Key** with automatic prefilled credentials.

---

## ⚡ How API Deactivation & Recovery Works

You can deactivate individual APIs or cluster-wide services to test Sentinel outage detection and automated incident creation:

### 1. Deactivating an Individual API Endpoint
On the **Endpoints** page ([http://localhost:5173/endpoints](http://localhost:5173/endpoints)):
- Click the **Deactivate** button directly on any endpoint row (or toggle inside the **Configure** modal).
- The endpoint will immediately enter `DEACTIVATED` state.
- Any HTTP call to that endpoint returns:
  ```json
  {
    "error": {
      "code": "ENDPOINT_DEACTIVATED",
      "message": "Endpoint 'GET /api/users' is currently DEACTIVATED in Sentinel API Playground.",
      "status": 503
    }
  }
  ```
- Click **Activate** at any time to immediately restore the endpoint back to normal `200 OK`.

### Via API:
```bash
# Deactivate an endpoint
curl -X POST http://localhost:4000/api/simulation/endpoints/users-get-all/deactivate

# Test it returns 503
curl -i http://localhost:4000/api/users

# Re-activate the endpoint
curl -X POST http://localhost:4000/api/simulation/endpoints/users-get-all/activate
```

### 2. Deactivating Chaos Scenarios (Recovery)
When any scenario is active (such as Payment Outage, Latency Spike, or Auth Failure):
- On the **Scenarios** page ([http://localhost:5173/scenarios](http://localhost:5173/scenarios)), click **Deactivate Scenario** or **Restore Normal Operation**.
- Or send a POST request:
  ```bash
  curl -X POST http://localhost:4000/api/simulation/deactivate
  ```
- All endpoints, rate limit counters, and latency knobs instantly reset to nominal `HEALTHY` operation.

---

## 🎬 Step 59 Demonstration Flow: Degradation → Outage → Alert → Incident → Recovery

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

## 📖 API Documentation

- **Interactive Swagger UI**: [http://localhost:4000/docs](http://localhost:4000/docs)
- **Raw OpenAPI 3.0 Schema**: [http://localhost:4000/openapi.json](http://localhost:4000/openapi.json)
- **Direct in-dashboard documentation**: [http://localhost:5173/docs](http://localhost:5173/docs)

---

## 📄 License

MIT License. Engineered for Sentinel API Monitoring & Reliability Testing.
