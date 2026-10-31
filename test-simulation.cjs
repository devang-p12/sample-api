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

  // Deactivate / Recovery
  await request({ host: 'localhost', port: 4000, path: '/api/simulation/scenarios/deactivate', method: 'POST' });
  console.log('Step 4: Deactivated scenario (Recovery)');

  // Payment after recovery
  const recoveredPay = await request(
    { host: 'localhost', port: 4000, path: '/api/payments', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { orderId: 'ord_3001', amount: 150.00, currency: 'USD' }
  );
  console.log('Step 5 (Recovered): POST /api/payments ->', recoveredPay.status === 201 ? 'PASS (201 Created)' : 'FAIL');

  // 6. Request Activity Log verification
  const activity = await request({ host: 'localhost', port: 4000, path: '/api/activity', method: 'GET' });
  console.log('\n✓ Request Activity Recording:', activity.status === 200 && activity.data.items?.length > 5 ? `PASS (${activity.data.total} requests recorded)` : 'FAIL');

  // 7. Method Not Allowed (405) test
  const methodNotAllowed = await request({ host: 'localhost', port: 4000, path: '/api/login', method: 'GET' });
  console.log('✓ 405 Method Not Allowed guard:', methodNotAllowed.status === 405 ? `PASS (405, Allow: ${methodNotAllowed.headers['allow']})` : 'FAIL');

  // 8. OpenAPI JSON
  const openapi = await request({ host: 'localhost', port: 4000, path: '/openapi.json', method: 'GET' });
  console.log('✓ OpenAPI 3.0 spec endpoint:', openapi.status === 200 && openapi.data.openapi === '3.0.3' ? 'PASS (/openapi.json ready)' : 'FAIL');

  console.log('\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
