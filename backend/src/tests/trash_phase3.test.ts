import { Firestore } from '@google-cloud/firestore';

const BASE_URL = 'http://localhost:8080';
const ADMIN_KEY = process.env.CHEFOS_ADMIN_API_KEY || '7180dd955231928ef6f6b56aff72a03f41b7d4ecae1b2b8b2d648b0756a4378a';

async function runPhase3Tests() {
  console.log('==================================================');
  console.log('  ChefOS Phase 3 Trash & Security Test Suite');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✓ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`✗ FAILED: ${name}`);
      console.log(`  Reason: ${err.message}`);
      failed++;
    }
  }

  // 1. Security Verification: Unauthorized access rejected with HTTP 401
  await test('Security: Unauthorized trash request rejected (HTTP 401)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/dummy-id/trash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
  });

  await test('Security: Unauthorized restore request rejected (HTTP 401)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/dummy-id/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
  });

  await test('Security: Unauthorized permanent delete request rejected (HTTP 401)', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/dummy-id-test/permanent`, {
      method: 'DELETE',
    });
    if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
  });

  // Create isolated test lead: PRUEBA PAPELERA CHEFOS
  let testLeadId = '';
  const testEmail = `prueba.papelera.${Date.now()}@chef4youbyfranko.test`;
  const testPhone = `+52322${Date.now().toString().slice(-7)}`;

  await test('Setup: Create test lead PRUEBA PAPELERA CHEFOS', async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'phase3-test-key-' + Date.now(),
      },
      body: JSON.stringify({
        fullName: 'PRUEBA PAPELERA CHEFOS',
        email: testEmail,
        phone: testPhone,
        preferredChannel: 'whatsapp',
        experienceType: 'villa_dinner',
        serviceArea: 'puerto_vallarta',
        source: 'phase3_test',
      }),
    });

    if (res.status !== 201) throw new Error(`Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    if (!data.id) throw new Error('Missing ID in response');
    testLeadId = data.id;
  });

  // 2. Soft Trash Test
  await test('Soft Trash: Move lead to trash with reason "prueba"', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/${testLeadId}/trash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_KEY,
      },
      body: JSON.stringify({ deleteReason: 'prueba' }),
    });

    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Soft trash failed');
  });

  // 3. Verify lead is filtered out of main inbox
  await test('Inbox Filter: Trashed lead does not appear in GET /api/leads', async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      headers: { 'x-api-key': ADMIN_KEY },
    });
    const data = await res.json();
    const activeLeads: any[] = data.data || [];
    const found = activeLeads.some((l) => l.id === testLeadId);
    if (found) throw new Error('Soft deleted lead was found in active leads list!');
  });

  // 4. Verify lead appears in Trash endpoint
  await test('Trash View: Trashed lead appears in GET /api/leads/trash', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/trash`, {
      headers: { 'x-api-key': ADMIN_KEY },
    });
    const data = await res.json();
    const trashLeads: any[] = data.data || [];
    const found = trashLeads.find((l) => l.id === testLeadId);
    if (!found) throw new Error('Soft deleted lead was NOT found in trash leads list!');
    if (found.deleteReason !== 'prueba') throw new Error(`Expected deleteReason "prueba", got ${found.deleteReason}`);
  });

  // 5. Restore Test
  await test('Restore: Restore lead back to main inbox', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/${testLeadId}/restore`, {
      method: 'POST',
      headers: { 'x-api-key': ADMIN_KEY },
    });

    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Restore failed');

    // Confirm it is back in active leads
    const resInbox = await fetch(`${BASE_URL}/api/leads`, {
      headers: { 'x-api-key': ADMIN_KEY },
    });
    const dataInbox = await resInbox.json();
    const found = (dataInbox.data || []).some((l: any) => l.id === testLeadId);
    if (!found) throw new Error('Restored lead is not back in active leads!');
  });

  // 6. Permanent Delete Test
  await test('Permanent Delete: Remove test lead permanently by ID', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/${testLeadId}/permanent`, {
      method: 'DELETE',
      headers: { 'x-api-key': ADMIN_KEY },
    });

    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);

    // Confirm document no longer exists in Firestore
    const firestore = new Firestore({ projectId: 'chefos-502422' });
    const docSnap = await firestore.collection('leads').doc(testLeadId).get();
    if (docSnap.exists) throw new Error('Document still exists in Firestore after permanent delete!');
  });

  console.log('==================================================');
  console.log(`  Phase 3 Test Suite Completed!`);
  console.log(`  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
}

runPhase3Tests().catch(console.error);
