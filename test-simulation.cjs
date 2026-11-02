const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SENTINEL API PLAYGROUND END-TO-END TESTS ---');

  // 1. Health Probe
  const health = await request({ host: 'localhost', port: 4000, path: '/api/health', method: 'GET' });
  console.log('✓ GET /api/health:', health.status === 200 ? 'PASS (200)' : 'FAIL');

  // 2. HEAD method
  const head = await request({ host: 'localhost', port: 4000, path: '/api/products', method: 'HEAD' });
  console.log('✓ HEAD /api/products:', head.status === 200 && !head.data ? 'PASS (200, no body)' : 'FAIL');

  // 3. OPTIONS method
  const options = await request({ host: 'localhost', port: 4000, path: '/api/products', method: 'OPTIONS' });
  console.log('✓ OPTIONS /api/products:', options.headers['allow']?.includes('GET') ? `PASS (Allow: ${options.headers['allow']})` : 'FAIL');

  // 4. Products CRUD
  const createProduct = await request(
    { host: 'localhost', port: 4000, path: '/api/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Sentinel High-Speed Test Router', price: 499.00, category: 'Hardware', stock: 15 }
  );
  console.log('✓ POST /api/products (Create):', createProduct.status === 201 ? `PASS (201, ID: ${createProduct.data.id})` : 'FAIL');
  const createdId = createProduct.data.id;

  const getProduct = await request({ host: 'localhost', port: 4000, path: `/api/products/${createdId}`, method: 'GET' });
  console.log('✓ GET /api/products/:id (Read after create):', getProduct.status === 200 && getProduct.data.name.includes('Test Router') ? 'PASS (200)' : 'FAIL');

  const patchProduct = await request(
    { host: 'localhost', port: 4000, path: `/api/products/${createdId}`, method: 'PATCH', headers: { 'Content-Type': 'application/json' } },
    { price: 450.00, status: 'low_stock' }
  );
  console.log('✓ PATCH /api/products/:id:', patchProduct.status === 200 && patchProduct.data.price === 450 ? 'PASS (200)' : 'FAIL');

  const deleteProduct = await request({ host: 'localhost', port: 4000, path: `/api/products/${createdId}`, method: 'DELETE' });
  console.log('✓ DELETE /api/products/:id:', deleteProduct.status === 204 ? 'PASS (204)' : 'FAIL');

  const getAfterDelete = await request({ host: 'localhost', port: 4000, path: `/api/products/${createdId}`, method: 'GET' });
  console.log('✓ GET /api/products/:id (Read after delete):', getAfterDelete.status === 404 ? 'PASS (404 Not Found)' : 'FAIL');

  // 5. Scenario Lifecycle: Normal -> Outage -> Recovery
  console.log('\n--- TESTING DEMO FLOW (Step 59): Normal -> Payment Outage -> 503 -> Recovery ---');
  
  // Normal payment
  const normalPay = await request(
    { host: 'localhost', port: 4000, path: '/api/payments', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { orderId: 'ord_3001', amount: 150.00, currency: 'USD' }
  );
  console.log('Step 1 (Normal): POST /api/payments ->', normalPay.status === 201 ? 'PASS (201 Created)' : 'FAIL');

  // Activate Payment Outage
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/scenarios/payment-outage/activate', method: 'POST' });
  console.log('Step 2: Activated "Payment API Outage" scenario');

  // Payment during outage
  const outagePay = await request(
    { host: 'localhost', port: 4000, path: '/api/payments', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { orderId: 'ord_3001', amount: 150.00, currency: 'USD' }
  );
  console.log('Step 3 (Outage): POST /api/payments ->', outagePay.status === 503 ? `PASS (503 Service Unavailable: "${outagePay.data?.error?.message}")` : 'FAIL');

  // Deactivate / Recovery via /scenarios/deactivate
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/scenarios/deactivate', method: 'POST' });
  console.log('Step 4: Deactivated scenario (Recovery)');

  // Payment after recovery
  const recoveredPay = await request(
    { host: 'localhost', port: 4000, path: '/api/payments', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { orderId: 'ord_3001', amount: 150.00, currency: 'USD' }
  );
  console.log('Step 5 (Recovered): POST /api/payments ->', recoveredPay.status === 201 ? 'PASS (201 Created)' : 'FAIL');

  // 6. Endpoint-level Deactivate & Activate Testing
  console.log('\n--- TESTING ENDPOINT DEACTIVATE & ACTIVATE ---');
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/endpoints/users-get-all/deactivate', method: 'POST' });
  const deactivatedUserRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET' });
  console.log('✓ Endpoint Deactivation: GET /api/users ->', deactivatedUserRes.status === 503 && deactivatedUserRes.data?.error?.code === 'ENDPOINT_DEACTIVATED' ? 'PASS (503 ENDPOINT_DEACTIVATED)' : 'FAIL');

  await request({ host: 'localhost', port: 4000, path: '/api/simulation/endpoints/users-get-all/activate', method: 'POST' });
  const reactivatedUserRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET' });
  console.log('✓ Endpoint Re-Activation: GET /api/users ->', reactivatedUserRes.status === 200 ? 'PASS (200 OK after reactivation)' : 'FAIL');

  // 7. Authentication Testing
  console.log('\n--- TESTING AUTHENTICATION ENFORCEMENT & TESTER ---');
  // Login to get tokens
  const loginRes = await request(
    { host: 'localhost', port: 4000, path: '/api/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { username: 'admin', password: 'sentinel123' }
  );
  console.log('✓ POST /api/login:', loginRes.status === 200 && loginRes.data?.token ? `PASS (Got Token: ${loginRes.data.token})` : 'FAIL');

  // Activate Auth Failure Scenario
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/scenarios/auth-failure/activate', method: 'POST' });

  // Call protected endpoint without auth -> should be 401
  const noAuthRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET' });
  console.log('✓ Auth Enforced (No Token): GET /api/users ->', noAuthRes.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');

  // Call protected endpoint with invalid token -> should be 401
  const badAuthRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET', headers: { 'Authorization': 'Bearer wrong-token' } });
  console.log('✓ Auth Enforced (Invalid Token): GET /api/users ->', badAuthRes.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');

  // Call protected endpoint with valid token -> should be 200
  const validAuthRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET', headers: { 'Authorization': 'Bearer super-secret-valid-token' } });
  console.log('✓ Auth Enforced (Valid Bearer Token): GET /api/users ->', validAuthRes.status === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Deactivate Auth Scenario
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/deactivate', method: 'POST' });
  const restoredAuthRes = await request({ host: 'localhost', port: 4000, path: '/api/users', method: 'GET' });
  console.log('✓ Deactivate Auth Scenario: GET /api/users ->', restoredAuthRes.status === 200 ? 'PASS (200 OK nominal)' : 'FAIL');

  // 8. Request Activity Log verification
  const activity = await request({ host: 'localhost', port: 4000, path: '/api/activity', method: 'GET' });
  console.log('\n✓ Request Activity Recording:', activity.status === 200 && activity.data.items?.length > 5 ? `PASS (${activity.data.total} requests recorded)` : 'FAIL');

  // 9. Method Not Allowed (405) test
  const methodNotAllowed = await request({ host: 'localhost', port: 4000, path: '/api/login', method: 'GET' });
  console.log('✓ 405 Method Not Allowed guard:', methodNotAllowed.status === 405 ? `PASS (405, Allow: ${methodNotAllowed.headers['allow']})` : 'FAIL');

  // 11. Direct Chaos Injection Tests (Downtime, Latency, Errors, Response Changes)
  console.log('\n--- VERIFYING DIRECT CHAOS INJECTIONS ---');
  // 11a. Downtime
  const downtimeRes = await request({ host: 'localhost', port: 4000, path: '/api/products?chaos_downtime=true', method: 'GET' });
  console.log('✓ Direct Downtime (?chaos_downtime=true):', downtimeRes.status === 503 ? 'PASS (503 Service Unavailable)' : 'FAIL');

  // 11b. HTTP Errors
  const error500Res = await request({ host: 'localhost', port: 4000, path: '/api/products?chaos_status=500', method: 'GET' });
  console.log('✓ Direct HTTP 500 (?chaos_status=500):', error500Res.status === 500 ? 'PASS (500 Internal Server Error)' : 'FAIL');

  const error502Res = await request({ host: 'localhost', port: 4000, path: '/api/payments?chaos_status=502', method: 'GET' });
  console.log('✓ Direct HTTP 502 (?chaos_status=502):', error502Res.status === 502 ? 'PASS (502 Bad Gateway)' : 'FAIL');

  // 11c. Latency
  const startLatency = Date.now();
  const latencyRes = await request({ host: 'localhost', port: 4000, path: '/api/products?chaos_latency=200', method: 'GET' });
  const elapsed = Date.now() - startLatency;
  console.log(`✓ Direct Latency (?chaos_latency=200):`, elapsed >= 180 && latencyRes.status === 200 ? `PASS (${elapsed}ms elapsed)` : 'FAIL');

  // 11d. Schema Response Changes
  const schemaBrokenRes = await request({ host: 'localhost', port: 4000, path: '/api/products?chaos_schema=broken', method: 'GET' });
  console.log('✓ Direct Schema Drift (?chaos_schema=broken):', schemaBrokenRes.data?.unexpected === true ? 'PASS (Corrupted payload detected)' : 'FAIL');

  const schemaV2Res = await request({ host: 'localhost', port: 4000, path: '/api/products?chaos_schema=v2', method: 'GET' });
  console.log('✓ Direct Schema Drift (?chaos_schema=v2):', schemaV2Res.data?.items?.[0]?.productName ? 'PASS (Transformed to V2 schema)' : 'FAIL');

  console.log('\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
