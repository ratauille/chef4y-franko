import fetch from 'node-fetch';

const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://chefos-backend-74980816903.us-central1.run.app';
const TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:8080';

const BASE_URL = (process.env.TEST_API_URL || TEST_API_URL).replace(/\/$/, '');

// Guard 1: Safety check against running write tests on production (.run.app)
if (BASE_URL.includes('.run.app') && process.env.ALLOW_PRODUCTION_TESTING !== 'true') {
  console.error('\n[SAFETY ABORT] TEST ABORTED: TEST_API_URL points to a Cloud Run production URL (.run.app).');
  console.error('Write tests against production Cloud Run are strictly forbidden.');
  console.error('Set TEST_API_URL=http://localhost:8080 or use NODE_ENV=test for local testing.\n');
  process.exit(1);
}

async function runTests() {
  console.log(`\n==================================================`);
  console.log(`  ChefOS Lead Integration Test Suite (Isolated)`);
  console.log(`  Target BASE_URL: ${BASE_URL}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'test'}`);
  console.log(`==================================================\n`);

  let passedCount = 0;
  let failedCount = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✓ PASSED: ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`✗ FAILED: ${name}`);
      console.error(`  Reason: ${err.message || err}`);
      failedCount++;
    }
  }

  // Test 1: Health check
  await assertTest('GET /health returns HTTP 200 and valid JSON', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const body: any = await res.json();
    if (!body.ok) throw new Error('Expected body.ok to be true');
  });

  // Test 2: Valid Lead creation
  let testLeadId = '';
  const testEmail = `test.unique.${Date.now()}@example.com`;
  const testPhone = `+52 322 ${Math.floor(1000000 + Math.random() * 9000000)}`;

  await assertTest('POST /api/leads creates valid lead (HTTP 201)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Cliente Prueba Aislada',
        email: testEmail,
        telefono: testPhone,
        servicio: 'Cena Privada en Villa',
        estado: 'pendiente',
      }),
    });

    if (res.status !== 201) {
      const errText = await res.text();
      throw new Error(`Expected HTTP 201, got ${res.status}: ${errText}`);
    }

    const body: any = await res.json();
    if (!body.success || !body.id) throw new Error('Response missing success flag or id');
    testLeadId = body.id;
  });

  // Test 3: Rejection of lead without name (HTTP 400)
  await assertTest('POST /api/leads rejects lead without name (HTTP 400)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sin.nombre@example.com',
        telefono: '+52 322 111 2233',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    const body: any = await res.json();
    if (body.error !== 'validation_error') throw new Error(`Expected error validation_error, got ${body.error}`);
  });

  // Test 4: Rejection of invalid email format (HTTP 400)
  await assertTest('POST /api/leads rejects malformed email (HTTP 400)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Prueba Email Malformado',
        email: 'correo_sin_dominio',
        telefono: '+52 322 111 2233',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
  });

  // Test 5: Idempotency with exact same Idempotency-Key
  await assertTest('Idempotency: Sending same Idempotency-Key twice returns same ID', async () => {
    const idempotencyKey = `iso-key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const uniquePhone = `+52 322 ${Math.floor(1000000 + Math.random() * 9000000)}`;
    const payload = {
      nombre: 'Prueba Idempotencia',
      email: `idempotent.${Date.now()}@example.com`,
      telefono: uniquePhone,
      servicio: 'Clase de Cocina',
    };

    // First request
    const res1 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (res1.status !== 201) throw new Error(`First request failed with HTTP ${res1.status}: ${await res1.text()}`);
    const body1: any = await res1.json();

    // Second request with SAME Idempotency-Key
    const res2 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (res2.status !== 200) throw new Error(`Second request expected HTTP 200, got ${res2.status}`);
    const body2: any = await res2.json();

    if (body2.id !== body1.id) {
      throw new Error(`Idempotency failure: First ID was ${body1.id}, second ID was ${body2.id}`);
    }
    if (!body2.duplicate) throw new Error('Expected duplicate flag to be true on second attempt');
  });

  // Test 6: Deduplication by Normalized Email
  await assertTest('Deduplication: Same normalized email within 15min returns existing lead ID', async () => {
    const dedupEmail = `dedup.email.${Date.now()}@example.com`;
    const phoneA = `+52 322 ${Math.floor(1000000 + Math.random() * 9000000)}`;
    const phoneB = `+52 322 ${Math.floor(1000000 + Math.random() * 9000000)}`;

    const payload1 = {
      nombre: 'Cliente Original Email',
      email: dedupEmail.toUpperCase(), // Mixed case test
      telefono: phoneA,
      servicio: 'Cena Romántica',
    };

    const res1 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1),
    });

    if (res1.status !== 201) throw new Error(`First request failed with HTTP ${res1.status}: ${await res1.text()}`);
    const body1: any = await res1.json();

    // Immediate second request with same email in lowercase
    const payload2 = {
      nombre: 'Cliente Duplicado Email',
      email: dedupEmail.toLowerCase(),
      telefono: phoneB,
      servicio: 'Cena Romántica',
    };

    const res2 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload2),
    });

    if (res2.status !== 200) throw new Error(`Deduplication request expected HTTP 200, got ${res2.status}`);
    const body2: any = await res2.json();

    if (body2.id !== body1.id) {
      throw new Error(`Email Deduplication failure: Expected ID ${body1.id}, got ${body2.id}`);
    }
    if (!body2.duplicate) throw new Error('Expected duplicate flag to be true');
  });

  // Test 7: Deduplication by Normalized Phone
  await assertTest('Deduplication: Same normalized phone within 15min returns existing lead ID', async () => {
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
    const sharedPhone = `+52 322 ${randomDigits}`;

    const payload1 = {
      nombre: 'Cliente Original Telefono',
      email: `orig.phone.${Date.now()}@example.com`,
      telefono: sharedPhone,
      servicio: 'Chef en Yate',
    };

    const res1 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1),
    });

    if (res1.status !== 201) throw new Error(`First request failed with HTTP ${res1.status}: ${await res1.text()}`);
    const body1: any = await res1.json();

    // Second request with same phone digits formatted differently
    const formattedPhone = `011 52 322-${randomDigits}`;
    const payload2 = {
      nombre: 'Cliente Duplicado Telefono',
      email: `dupe.phone.${Date.now()}@example.com`,
      telefono: formattedPhone,
      servicio: 'Chef en Yate',
    };

    const res2 = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload2),
    });

    if (res2.status !== 200) throw new Error(`Phone Deduplication request expected HTTP 200, got ${res2.status}: ${await res2.text()}`);
    const body2: any = await res2.json();

    if (body2.id !== body1.id) {
      throw new Error(`Phone Deduplication failure: Expected ID ${body1.id}, got ${body2.id}`);
    }
    if (!body2.duplicate) throw new Error('Expected duplicate flag to be true');
  });

  // Test 8: Recent leads list with limit
  await assertTest('GET /api/leads/recent?limit=5 returns sanitized recent list', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/recent?limit=5`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const body: any = await res.json();
    if (!body.success || !Array.isArray(body.data)) throw new Error('Expected success true and data array');
    if (body.data.length > 5) throw new Error(`Expected at most 5 leads, got ${body.data.length}`);
  });

  console.log(`\n==================================================`);
  console.log(`  Test Suite Completed Successfully!`);
  console.log(`  Total: ${passedCount + failedCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log(`==================================================\n`);

  if (failedCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
