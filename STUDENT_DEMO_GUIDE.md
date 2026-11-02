# 🎓 Student Demonstration Guide: API Reliability & Chaos Simulation Platform

This platform allows students to demonstrate how API monitoring, alerting, circuit breakers, and client applications behave when microservices intentionally experience **Downtime**, **Latency**, **HTTP Errors**, and **Response Changes (Schema Drift)**.

Students can demonstrate each scenario in **two simple ways**:
1. **Interactive Web Dashboard**: Using one-click toggle switches, sliders, pre-built disaster scenarios, and the built-in API Tester with live activity logging.
2. **Direct API Parameters / Headers**: In cURL, Postman, fetch, Python, or automated scripts using instant query parameters (`?chaos_*`) or headers (`X-Chaos-*`).

---

## 🚀 Quick Deployment Guide: Render (Backend) & Vercel (Frontend)

### Part 1: Deploy Backend on Render (Free)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `sentinel-simulation-backend` (or any name you choose)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Advanced** / **Environment Variables**, add:
   - `NODE_ENV` = `production`
5. Click **Create Web Service**.
6. When deployment finishes, copy your live Render URL (e.g., `https://simulation-api.onrender.com`).
   - Probe health check: `https://your-service.onrender.com/api/health`
   - Live Swagger documentation: `https://your-service.onrender.com/docs`

*(Note: A `render.yaml` blueprint is also included in the repository for 1-click Render Blueprint deployments).*

---

### Part 2: Deploy Frontend on Vercel (Free)

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add (optional but recommended):
   - `VITE_API_URL` = Your Render backend URL (e.g. `https://simulation-api.onrender.com`)
5. Click **Deploy**.
6. Open your Vercel URL! 

> 💡 **Dynamic Backend Switcher**: If you didn't configure `VITE_API_URL` during build, you can simply click the **"Backend: ..."** button in the top navigation bar of the deployed frontend and paste your Render URL. You can test ping it with 1 click!

---

## 📦 Sample APIs Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health probe (returns status, uptime, timestamp) |
| `GET` | `/api/payments/health` | Payment gateway dedicated health probe |
| `GET` | `/api/products` | Paginated product list (`?page=1&limit=5&category=Electronics`) |
| `GET` | `/api/products/:id` | Get product details by ID |
| `POST` | `/api/products` | Create a product (`{ name, price, category, stock }`) |
| `POST` | `/api/payments` | Process payment (`{ orderId, amount, currency, paymentMethod }`) |
| `GET` | `/api/orders` | List customer orders |
| `POST` | `/api/orders` | Place new order (`{ userId, items: [...] }`) |
| `GET` | `/api/users` | List users (`?role=developer`) |
| `POST` | `/api/login` | Authenticate user & issue JWT token (`{ username, password }`) |
| `GET` | `/api/v1/products` | Standard V1 product schema |
| `GET` | `/api/v2/products` | V2 product schema (with renamed fields) |

---

## 🧪 Student Demonstration Walkthrough

Here is how students can demonstrate each of the 4 required failure modes:

---

### Demonstration 1: Downtime (Service Unavailable / Outage)

Students demonstrate how monitoring platforms detect when a service completely drops offline.

#### Method A — Through the Web UI:
1. Open the Web Dashboard.
2. Navigate to **Scenarios** tab.
3. Click **Activate** on **"Global Outage Simulation"** (or **"Payment API Outage"**).
4. Notice the header status badge turns to **GLOBAL OUTAGE (Flashing Red)**.
5. Go to **API Tester** tab, click **Send Request** on any endpoint.
6. **Result**: Response returns `HTTP 503 Service Unavailable` with error JSON.
7. Click **Reset All** in the header to instantly restore healthy state.

#### Method B — In Postman / cURL (Direct Parameter):
Students can intentionally crash any request on demand:
```bash
# Add ?chaos_downtime=true to any endpoint:
curl -i "https://your-backend.onrender.com/api/products?chaos_downtime=true"

# Or using HTTP Header:
curl -i -H "X-Chaos-Downtime: true" "https://your-backend.onrender.com/api/products"
```
**Expected Response**:
```http
HTTP/1.1 503 Service Unavailable
X-Simulation-Mode: CHAOS_DOWNTIME
Content-Type: application/json

{
  "error": {
    "code": "SIMULATED_DOWNTIME_OUTAGE",
    "message": "Simulated service downtime: Service is completely unavailable (503 Service Unavailable).",
    "status": 503
  }
}
```

---

### Demonstration 2: Latency (Slow Response / Delay / Timeout)

Students demonstrate detecting network congestion, slow database queries, or gateway timeouts.

#### Method A — Through the Web UI:
1. Go to **Global Controls** (Settings) tab.
2. Drag the **Global Latency Slider** to `2500 ms` and click Save.
3. Open **API Tester**, select `GET {{baseUrl}}/api/products`, and click **Send**.
4. **Result**: Watch the response timer display `~2500ms`, with `X-Response-Time: 2500ms` header.
5. In **Activity Log**, inspect the request highlighted in amber with high response latency.

#### Method B — In Postman / cURL (Direct Parameter):
```bash
# Inject 3,000ms delay into the request:
curl -i "https://your-backend.onrender.com/api/products?chaos_latency=3000"

# Or using HTTP Header:
curl -i -H "X-Chaos-Latency: 3000" "https://your-backend.onrender.com/api/products"
```
**Expected Response**: Request takes exactly 3 seconds, returns `X-Response-Time: 3002ms`.

---

### Demonstration 3: HTTP Errors (500, 502, 504, 429)

Students demonstrate how circuit breakers or retry logic handle specific HTTP status codes.

#### Method A — Through the Web UI:
1. Navigate to **Endpoints** tab.
2. Find `POST /api/payments` and click **Configure Simulation**.
3. Set **Status Code Override** to `502 Bad Gateway` (or `500 Internal Server Error`).
4. Switch to **API Tester** tab, click preset **Process Payment (POST)**, and click **Send**.
5. **Result**: Observe the red `502 Bad Gateway` badge and structured error object.
6. Try the **Rate Limit (429)** scenario under **Scenarios** tab to demonstrate `429 Too Many Requests` when sending rapid requests!

#### Method B — In Postman / cURL (Direct Parameter):
```bash
# Intentionally trigger 500 Internal Server Error:
curl -i "https://your-backend.onrender.com/api/products?chaos_status=500"

# Intentionally trigger 502 Bad Gateway:
curl -i "https://your-backend.onrender.com/api/payments?chaos_status=502"

# Intentionally trigger 429 Rate Limit:
curl -i "https://your-backend.onrender.com/api/orders?chaos_status=429"
```
**Expected Response**:
```http
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{
  "error": {
    "code": "SIMULATED_HTTP_ERROR_502",
    "message": "Bad Gateway: Invalid response received from upstream microservice.",
    "status": 502
  }
}
```

---

### Demonstration 4: Response Changes & Schema Drift

Students demonstrate detecting unexpected API contract changes where an API returns `200 OK`, but fields have changed, causing silent failures in frontends or consumers.

#### What Changes:
- `name` ➔ `productName`
- `price` ➔ `amount`
- `stock` ➔ `inventoryCount`
- Corrupted mode: payload replaced with corrupted error schema

#### Method A — Through the Web UI:
1. Go to **Endpoints** tab.
2. Find `GET /api/products` and click **Configure Simulation**.
3. Under **Schema Version Drift**, select **V2 (Breaking field renames)**.
4. Go to **API Tester** and click **Send Request** on `GET {{baseUrl}}/api/products`.
5. **Result**: The HTTP status is `200 OK`, but the JSON payload has mutated fields (`productName`, `amount`, `inventoryCount`)!

#### Method B — In Postman / cURL (Direct Parameter):
```bash
# Test breaking schema drift (fields mutated):
curl -i "https://your-backend.onrender.com/api/products?chaos_schema=v2"

# Test corrupted broken payload:
curl -i "https://your-backend.onrender.com/api/products?chaos_schema=broken"
```

**Normal Payload (`?page=1&limit=1`)**:
```json
{
  "items": [
    {
      "id": "prd_2001",
      "name": "Sentinel Ultra Laptop 16",
      "price": 2499,
      "stock": 42
    }
  ]
}
```

**Changed Payload with Schema Drift (`?chaos_schema=v2`)**:
```json
{
  "items": [
    {
      "id": "prd_2001",
      "productName": "Sentinel Ultra Laptop 16",
      "amount": 2499,
      "inventoryCount": 42,
      "apiVersion": "v2"
    }
  ],
  "schemaVersion": "v2"
}
```

---

## 📊 Live Observability & Activity Log

Whenever students inject failures or make requests, they can open the **Activity Log** tab:
- Every request is logged in real-time with method, path, HTTP status, and duration.
- Click any request log entry to inspect full **Request Headers**, **Request Body**, **Response Headers**, and **Response Body**.
- Filter by status codes (`2xx`, `4xx`, `5xx`), HTTP method, or latency.

---

## 🛠️ Summary for Evaluation & Grading

When presenting, students can follow this simple 3-minute sequence:
1. **Show Nominal State**: Run `GET /api/products` and `POST /api/payments` (Both succeed 200/201).
2. **Inject Downtime**: Trigger Outage -> Show `503 Service Unavailable`.
3. **Inject Latency**: Trigger 3s delay -> Show request taking 3,000ms.
4. **Inject Error**: Trigger `502 Bad Gateway` on Payment API -> Show `502` error capture.
5. **Inject Schema Drift**: Trigger `v2` schema -> Show field mutation (`name` ➔ `productName`).
6. **Recovery**: Click **"Reset All"** -> Everything returns to healthy green nominal state!
